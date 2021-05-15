import { EntityTarget, FindManyOptions } from "typeorm";
import { Context } from "../../0-definitions/context";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { SavedTarget, SaveTarget, Transaction, TxSet } from "./transaction";

export class DummyTx implements Transaction {
  readonly context: Context;

  insert<T extends MyBaseEntity<any>>(entity: T): Promise<T> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
  update<T extends MyBaseEntity<any>>(entity: T): Promise<T> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
  find<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    options?: FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T[]> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
  findOne<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    optionsOrId?: string | FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T | undefined> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
  findOneOrFail<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    optionsOrId: string | FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
  save(targets: SaveTarget[]): Promise<SavedTarget[]> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
}

export const DUMMY_TX_SET: TxSet = {
  txClass: DummyTx,
  readonlyTxClass: DummyTx,
};
