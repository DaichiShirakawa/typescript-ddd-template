import { EntityTarget, FindManyOptions, EntityManager } from "typeorm";
import { Context, ContextHolder } from "../../0-definitions/context";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { BaseModel } from "../../2-models/base/base-model";

/**
 * Transaction ですべきことだけを定義した型
 */
export type Transaction<C extends Context = Context> = ContextHolder<C> & {
  /**
   * insert した後、最新のデータを select して返します
   */
  insert<T extends MyBaseEntity>(entity: T): Promise<T>;

  /**
   * update した後、最新のデータを select して返します
   */
  update<T extends MyBaseEntity>(entity: T): Promise<T>;

  find<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    options?: FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T[]>;

  findOne<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    optionsOrId?: FindManyOptions<Omit<T, "tenantId">> | string
  ): Promise<T | undefined>;

  findOneOrFail<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    optionsOrId: FindManyOptions<Omit<T, "tenantId">> | string
  ): Promise<T>;

  save(targets: SaveTarget[]): Promise<SavedTarget[]>;
};

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
   * コールバックに SavedTarget 等を渡す。
   * テスト用途を想定
   */
  statistics?: (params: { savedTargets: SavedTarget[] }) => void;
}>;

export type ReadonlyTxProcessor<R = undefined> = (
  tx: Transaction
) => R | Promise<R>;

export type TxSet<C extends Context = Context> = {
  txClass: new (tx: EntityManager, ch: ContextHolder<C>) => Transaction;
  readonlyTxClass: new (tx: EntityManager, ch: ContextHolder<C>) => Transaction;
  // tx: <R>(ch: ContextHolder<C>, func: TxProcessor<R>) => Promise<R>;
  // readonlyTx: <R>(
  //   ch: ContextHolder<C>,
  //   func: ReadonlyTxProcessor<R>
  // ) => Promise<R>;
};

export type SaveTarget = {
  model: BaseModel;
  dependencyName: string;
  dependencyArrayIndex?: number;
  entity: MyBaseEntity;
};

export type SavedTarget = SaveTarget & {
  savedEntity: MyBaseEntity;
};
