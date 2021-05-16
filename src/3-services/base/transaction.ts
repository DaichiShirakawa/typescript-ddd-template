import { EntityTarget, FindManyOptions } from "typeorm";
import { Context, ContextHolder } from "../../0-definitions/context";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { BaseModel } from "../../2-models/base/base-model";

/**
 * Transaction ですべきことだけを定義した型
 */
export abstract class Transaction<C extends Context = Context>
  implements ContextHolder<C>
{
  readonly context: C;
  readonly isReadonly: boolean;

  constructor(ch: ContextHolder<C>, isReadonly: boolean) {
    this.context = ch.context;
    this.isReadonly = isReadonly;
  }

  /**
   * insert した後、最新のデータを select して返します
   */
  abstract insert<T extends MyBaseEntity>(entity: T): Promise<T>;

  /**
   * update した後、最新のデータを select して返します
   */
  abstract update<T extends MyBaseEntity>(entity: T): Promise<T>;

  abstract find<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    options?: FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T[]>;

  abstract findOne<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    optionsOrId?: FindManyOptions<Omit<T, "tenantId">> | string
  ): Promise<T | undefined>;

  abstract findOneOrFail<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    optionsOrId: FindManyOptions<Omit<T, "tenantId">> | string
  ): Promise<T>;

  abstract save(targets: SaveTarget[]): Promise<SavedTarget[]>;
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
   * コールバックに SavedTarget 等を渡す。
   * テスト用途を想定
   */
  statistics?: (params: { savedTargets: SavedTarget[] }) => void;
}>;

export type ReadonlyTxProcessor<R = undefined> = (
  tx: Transaction
) => R | Promise<R>;

export type TxStarters<C extends Context = Context> = {
  tx: <R>(ch: ContextHolder<C>, func: TxProcessor<R>) => Promise<R>;
  readonlyTx: <R>(
    ch: ContextHolder<C>,
    func: ReadonlyTxProcessor<R>
  ) => Promise<R>;
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
