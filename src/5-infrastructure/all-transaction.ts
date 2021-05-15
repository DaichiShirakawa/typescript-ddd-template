import { EntityManager, EntityTarget, FindManyOptions } from "typeorm";
import { MyBaseEntity } from "../1-entities/base/base-entity";
import { EntityHelper } from "../1-entities/base/entity-helper";
import {
  SavedTarget,
  SaveTarget,
  Transaction,
  TxProcessor,
  TxStarter,
} from "../3-services/base/transaction";
import { HttpsError } from "../express/https-error";
import { Context, ContextHolder } from "../express/security/base-context";
import { TransactionHelper } from "./transaction-helper";

/**
 * TypeORM のトランザクション(EntityManager) を拡張した Transaction です。
 * すべてのデータへアクセスすることができます。
 *
 * - insert/update 後に最新データを select して返すなど、拡張されています
 * - セーブ対象のモデルが持つサブモデルも含めすべてのentityをセーブするなどできます
 */
export class AllTransaction<C extends Context = Context>
  implements Transaction<C>
{
  readonly context: C;
  protected readonly tx: EntityManager;

  constructor(tx: EntityManager, ch: ContextHolder<C>) {
    this.tx = tx;
    this.context = ch.context;
  }

  static get starter(): TxStarter<any> {
    return (ch: ContextHolder, func: TxProcessor<AllTransaction>) =>
      TransactionHelper.start(AllTransaction, ch, func);
  }

  /**
   * insert した後、最新のデータを select して返します
   */
  async insert<T extends MyBaseEntity>(entity: T): Promise<T> {
    const saveEntity = EntityHelper.asSaveEntity(entity);
    await this.tx.insert(entity.constructor, saveEntity);
    return await this.tx.findOneOrFail(entity.constructor, {
      where: TransactionHelper.toPrimaryWhere(entity),
    });
  }

  /**
   * update した後、最新のデータを select して返します
   */
  async update<T extends MyBaseEntity>(entity: T): Promise<T> {
    const saveEntity = EntityHelper.asSaveEntity(entity);
    const where = TransactionHelper.toPrimaryWhere(entity);
    await this.tx.update(entity.constructor, where, saveEntity);
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

  async save(targets: SaveTarget[]): Promise<SavedTarget[]> {
    const savedTargets: SavedTarget[] = [...(targets as any)].sort(
      (a, b) => a.entity.txSeq - b.entity.txSeq
    );

    for (const target of savedTargets) {
      if (target.entity.isNeedInsert) {
        target.savedEntity = await this.insert(target.entity);
      } else {
        target.savedEntity = await this.update(target.entity);
      }
    }

    return savedTargets;
  }
}
