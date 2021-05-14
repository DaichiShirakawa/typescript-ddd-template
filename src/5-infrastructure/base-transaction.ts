import { isArray } from "lodash";
import {
  EntityManager,
  EntityTarget,
  FindConditions,
  FindManyOptions,
  getConnection,
  getRepository,
  ObjectLiteral,
} from "typeorm";
import { Tenant } from "../1-entities/tenant.entity";
import { MyBaseEntity } from "../1-entities/_base-entity";
import { TenantEntity } from "../1-entities/_tenant-entity";
import { BaseModel } from "../2-models/_base-model";
import { TenantContext } from "../express/security/tenant-context";
import { HttpsError } from "../express/https-error";
import { ContextHolder, BaseContext } from "../express/security/base-context";
import { ORMHelper } from "../helpers/orm-helper";

/**
 * TypeORM のトランザクション(EntityManager) を拡張した Transaction です。
 *
 * - insert/update 後に最新データを select して返すなど、拡張されています
 * - セーブ対象のモデルが持つサブモデルも含めすべてのentityをセーブするなどできます
 */
export class BaseTransaction<C extends BaseContext = BaseContext>
  implements ContextHolder<C>
{
  readonly context: C;
  protected readonly tx: EntityManager;

  constructor(tx: EntityManager, ch: ContextHolder<C>) {
    this.tx = tx;
    this.context = ch.context;
  }

  /**
   * models 管理下にあるすべての entities を Save したあとに result() の結果を返します
   * @param func().models saveModels によって Model.entities のすべてが Save されます
   * @param func().result saveModels 後に実行されます
   * @param func().statistics saveModels 後に実行されます。テスト用途を想定しています。
   */
  protected static async _start<
    TxType extends BaseTransaction,
    C extends BaseContext,
    R
  >(
    txClass: new (tx: EntityManager, ch: ContextHolder<C>) => TxType,
    ch: ContextHolder<C>,
    func: TxProcessor<TxType, R>
  ): Promise<R> {
    return await getConnection().transaction(async (tx) => {
      const btx = new txClass(tx, ch);
      const result = await func(btx);

      const targets = result.saveModels.flatMap((model) =>
        btx.toSaveTargets(model)
      );

      const savedEntities = await btx.save(targets);

      if (result.statistics) {
        result.statistics({ savedEntities });
      }

      return result.returns ? result.returns() : (undefined as any);
    });
  }

  public static async start<R>(
    ch: ContextHolder,
    func: TxProcessor<BaseTransaction, R>
  ) {
    return BaseTransaction._start(BaseTransaction, ch, func);
  }

  /**
   * insert した後、最新のデータを select して返します
   */
  async insert<T extends MyBaseEntity>(entity: T): Promise<T> {
    await this.tx.insert(entity.constructor, entity.asTypeORMSaveEntity);
    return await this.tx.findOneOrFail(entity.constructor, {
      where: ORMHelper.toPrimaryWhere(entity),
    });
  }

  /**
   * update した後、最新のデータを select して返します
   */
  async update<T extends MyBaseEntity>(entity: T): Promise<T> {
    const where = ORMHelper.toPrimaryWhere(entity);
    await this.tx.update(entity.constructor, where, entity.asTypeORMSaveEntity);
    entity.txSaved();
    return await this.tx.findOneOrFail(entity.constructor, { where });
  }

  find<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    options?: FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T[]> {
    options = { ...options };
    return this.tx.find(entityClass, options) as Promise<T[]>;
  }

  findOne<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    optionsOrId?: FindManyOptions<Omit<T, "tenantId">> | string
  ): Promise<T | undefined> {
    const isId = typeof optionsOrId === "string";
    const options: FindManyOptions<Omit<T, "tenantId">> = isId
      ? { where: optionsOrId as string }
      : { ...(optionsOrId as any) };
    return this.tx.findOne(entityClass, options) as Promise<T>;
  }

  async findOneOrFail<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    optionsOrId: FindManyOptions<Omit<T, "tenantId">> | string
  ): Promise<T> {
    const data = await this.findOne(entityClass, optionsOrId);
    if (data == null) {
      throw new HttpsError(
        "not-found",
        `No data for ${(optionsOrId as any).where || optionsOrId}`,
        optionsOrId
      );
    }
    return data;
  }

  protected async save(targets: SaveTarget[]): Promise<MyBaseEntity[]> {
    targets = targets.sort((a, b) => a.processSeq - b.processSeq);
    for (const target of targets) {
      if (target.entity.txNeedInsert) {
        await this.insert(target.entity).then((r) => (target.savedEntity = r));
      } else {
        await this.update(target.entity).then((r) => (target.savedEntity = r));
      }
    }

    this.updateModelEntities(targets);

    return targets.map((e) => e.savedEntity!);
  }

  /**
   * @param models
   * @returns 配列化された model / entity の組み合わせ
   */
  private toSaveTargets(
    model: BaseModel,
    _map = new Map<string, SaveTarget>()
  ): SaveTarget[] {
    const entities = model.freezedEntities;

    const setData = (
      name: string,
      data: BaseModel | MyBaseEntity,
      arrayIndex?: number
    ) => {
      if (data instanceof BaseModel) {
        this.toSaveTargets(data, _map);
      } else if (data instanceof MyBaseEntity) {
        if (data._instanceSeq <= (_map.get(data.id)?.processSeq || 0)) return;
        _map.set(data.id, {
          model: model,
          entity: data,
          processSeq: data._instanceSeq,
          name,
          arrayIndex,
        });
      }
    };

    for (const name in entities) {
      const data = (entities as any)[name];
      if (isArray(data)) {
        data.forEach((each, arrayIndex) => setData(name, each, arrayIndex));
      } else {
        setData(name, data);
      }
    }

    return [..._map.values()].filter(
      (e) => e.entity.txNeedInsert || e.entity.txNeedUpdate
    );
  }

  /**
   * @param targets target.savedEntityを、Model.entitiesに反映します
   */
  private updateModelEntities(targets: SaveTarget[]) {
    for (const target of targets) {
      if (target.arrayIndex != null) {
        target.model.txUpdateEntities((entities) => {
          (entities as any)[target.name][target.arrayIndex!] =
            target.savedEntity || target.entity;
        });
      } else {
        target.model.txUpdateEntities((entities) => {
          (entities as any)[target.name] = target.savedEntity || target.entity;
        });
      }
    }
  }
}

export type TxProcessor<TxType, R = undefined> = (tx: TxType) => Promise<{
  returns?: () => R | Promise<R>;
  saveModels: BaseModel[];
  statistics?: (params: { savedEntities: MyBaseEntity[] }) => void;
}>;

type SaveTarget = {
  model: BaseModel;
  name: string;
  arrayIndex?: number;
  entity: MyBaseEntity;
  processSeq: number;
  savedEntity?: MyBaseEntity;
};
