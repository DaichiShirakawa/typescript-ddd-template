import { EntityTarget, FindManyOptions } from "typeorm";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { ContextHolder } from "../../0-definitions/context";
import { TxProcessor, ReadonlyTxProcessor } from "./transaction";
import {
  SavedTarget,
  SaveTarget,
  Transaction,
  TxStarters,
} from "./transaction";

export class DummyTx extends Transaction {
  static async startTx<R>(ch: ContextHolder, func: TxProcessor<R>): Promise<R> {
    console.error(`Start ${DummyTx.constructor.name}`);
    const tx = new DummyTx(ch, false);
    const result = await func(tx);
    return result.returns ? result.returns() : (null as any);
  }

  static async startReadonlyTx<R>(
    ch: ContextHolder,
    func: ReadonlyTxProcessor<R>
  ): Promise<R> {
    console.error(`Start READONLY ${DummyTx.constructor.name}`);
    const tx = new DummyTx(ch, true);
    const result = await func(tx);
    return result;
  }

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

export const DUMMY_TX_STARTERS: TxStarters = {
  tx: DummyTx.startTx,
  readonlyTx: DummyTx.startReadonlyTx,
};
