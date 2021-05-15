import { EntityTarget, FindManyOptions } from "typeorm";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { BaseModel } from "../../2-models/base/base-model";
import { Context, ContextHolder } from "../../express/security/base-context";

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

export type TxStarter<C extends Context = Context, R = any> = (
  ch: ContextHolder<C>,
  func: TxProcessor<R>
) => Promise<R>;

export type SaveTarget = {
  model: BaseModel;
  dependencyName: string;
  dependencyArrayIndex?: number;
  entity: MyBaseEntity;
};

export type SavedTarget = SaveTarget & {
  savedEntity: MyBaseEntity;
};

export interface Transaction<C extends Context = Context>
  extends ContextHolder<C> {
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
}
