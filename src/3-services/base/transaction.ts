import { EntityTarget, FindManyOptions } from "typeorm";
import { HttpsError } from "../../0-base/https-error";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { BaseModel } from "../../2-models/base/base-model";
import { TransactionHelper } from "./transaction-helper";

/**
 * Transaction ですべきことだけを定義した型
 */
export abstract class Transaction {
  readonly isReadonly: boolean;

  constructor(isReadonly: boolean) {
    this.isReadonly = isReadonly;
  }

  /**
   *
   * @param ch
   * @param func
   * @param tx
   * @param commit save によって更新された entity をモデルの内容へ反映する。DBのcommit処理がある場合、引数渡しする
   * @returns
   */
  static async startTx<R>(
    func: TxProcessor<R>,
    tx: Transaction,
    commit = (savedTargets: SavedTarget[]): void | Promise<void> => {}
  ): Promise<R> {
    const result = await func(tx);

    const saveTargets = result.saveModels.flatMap((model) =>
      TransactionHelper.toSaveTargets(model)
    );

    TransactionHelper.checkDuplicate(saveTargets);

    const savedTargets = await tx.save(saveTargets);

    if (result.statistics) {
      result.statistics({ savedTargets });
    }

    await commit(savedTargets);
    TransactionHelper.updateDependencies(savedTargets);

    return result.returns ? await result.returns() : (null as any);
  }

  static async startReadonlyTx<R>(
    func: ReadonlyTxProcessor<R>,
    tx: Transaction
  ): Promise<R> {
    return await func(tx);
  }

  /**
   * insert した後、最新のデータを select して返します
   */
  abstract insert<T extends MyBaseEntity>(entity: T): Promise<T>;

  /**
   * update した後、最新のデータを select して返します
   */
  abstract update<T extends MyBaseEntity>(entity: T): Promise<T>;

  abstract find<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    options?: FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T[]>;

  abstract findOne<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    optionsOrId?: FindManyOptions<Omit<T, "tenantId">> | string
  ): Promise<T | undefined>;

  abstract findOneOrFail<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    optionsOrId: FindManyOptions<Omit<T, "tenantId">> | string
  ): Promise<T>;

  async save(targets: SaveTarget[]): Promise<SavedTarget[]> {
    if (this.isReadonly) {
      throw new HttpsError("internal", `Read only transaction`);
    }

    targets = [...targets].sort(
      (a, b) =>
        a.entity.instanceMeta.createSeq - b.entity.instanceMeta.createSeq
    );

    const savedTargets: SavedTarget[] = [];

    for (const target of targets) {
      if (target.entity.instanceMeta.isNewEntity) {
        savedTargets.push({
          ...target,
          savedEntity: await this.insert(target.entity),
          inserted: true,
        });
      } else if (0 < target.entity.instanceMeta.updatedProps.size) {
        savedTargets.push({
          ...target,
          savedEntity: await this.update(target.entity),
          updatedPropNames: target.entity.instanceMeta
            .updatedProps as ReadonlySet<string>,
        });
      }
    }

    return savedTargets;
  }
}

export type TxProcessor<R = undefined> = (tx: Transaction) => Promise<{
  /**
   * Transaction の成功時、このコールバックの戻りが Transaction の戻りとなる
   */
  returns?: () => R | Promise<R>;
  /**
   * Transaction で save 対象とする Models
   */
  saveModels: BaseModel[];
  /**
   * SavedTargets 等を使ってなにかしたい時を想定
   */
  statistics?: (params: { savedTargets: SavedTarget[] }) => void;
}>;

export type ReadonlyTxProcessor<R = undefined> = (
  tx: Transaction
) => R | Promise<R>;

export type SaveTarget<E extends MyBaseEntity = MyBaseEntity> = {
  model: BaseModel;
  dependencyName: string;
  dependencyArrayIndex?: number;
  entity: E;
};

export type SavedTarget<E extends MyBaseEntity = MyBaseEntity> =
  SaveTarget<E> & {
    savedEntity: E;
    inserted?: boolean;
    updatedPropNames?: ReadonlySet<string>;
  };
