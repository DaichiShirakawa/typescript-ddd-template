import { EntityTarget, FindManyOptions } from "typeorm";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { TxProcessor, ReadonlyTxProcessor } from "./transaction";
import { SavedTarget, SaveTarget, Transaction } from "./transaction";
import { logs } from "../../0-base/logs-context";

export class DummyTx extends Transaction {
  static async startTx<R>(func: TxProcessor<R>): Promise<R> {
    logs().info(`Start ${DummyTx.constructor.name}`);
    const tx = new DummyTx(false);
    const result = await func(tx);
    return result.returns ? result.returns() : (null as any);
  }

  static async startReadonlyTx<R>(func: ReadonlyTxProcessor<R>): Promise<R> {
    logs().info(`Start READONLY ${DummyTx.constructor.name}`);
    const tx = new DummyTx(true);
    const result = await func(tx);
    return result;
  }

  insert<T extends MyBaseEntity>(entity: T): Promise<T> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
  update<T extends MyBaseEntity>(entity: T): Promise<T> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
  find<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    options?: FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T[]> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
  findOne<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    optionsOrId?: string | FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T | undefined> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
  findOneOrFail<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    optionsOrId: string | FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
  save(targets: SaveTarget[]): Promise<SavedTarget[]> {
    throw new Error("Need set Transaction implementation to Service.TX_SET");
  }
}
