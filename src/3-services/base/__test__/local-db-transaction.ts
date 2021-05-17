import cloneDeep from "lodash/cloneDeep";
import { EntityTarget, FindManyOptions } from "typeorm";
import { Context, ContextHolder } from "../../../0-base/context";
import { HttpsError } from "../../../0-base/https-error";
import { MyBaseEntity } from "../../../1-entities/base/base-entity";
import { ReadonlyTxProcessor, Transaction, TxProcessor } from "../transaction";

let DB: { [entityName: string]: MyBaseEntity[] } = {};

export class LocalDBTransaction<
  C extends Context = Context
> extends Transaction<C> {
  /**
   * models 管理下にあるすべての entities を Save したあとに returns() の結果を返す
   */
  static async startTx<R>(ch: ContextHolder, func: TxProcessor<R>): Promise<R> {
    const backup = cloneDeep(DB);
    try {
      console.log(`Start ${LocalDBTransaction.constructor.name}`);

      const tx = new LocalDBTransaction(ch, false);
      const result = await super.startTx(ch, func, tx);

      console.log(`Commit ${LocalDBTransaction.constructor.name}`);

      return result;
    } catch (e) {
      console.log(`Rollback ${LocalDBTransaction.constructor.name}`);
      DB = backup;
      throw e;
    }
  }

  /**
   * 保存系が封じられた Tx
   */
  static async startReadonlyTx<R>(
    ch: ContextHolder,
    func: ReadonlyTxProcessor<R>
  ): Promise<R> {
    try {
      console.log(`Start READONLY ${LocalDBTransaction.constructor.name}`);
      const tx = new LocalDBTransaction(ch, true);
      return super.startReadonlyTx(ch, func, tx);
    } catch (e) {
      throw e;
    } finally {
      console.log(`Rollback READONLY ${LocalDBTransaction.constructor.name}`);
    }
  }

  private tableOf<T extends MyBaseEntity>(
    entity: T | (new () => T)
  ): MyBaseEntity[] {
    const name =
      entity instanceof MyBaseEntity
        ? entity.constructor.name
        : (entity as any).name;
    DB[name] = DB[name] || [];
    return DB[name];
  }

  async insert<T extends MyBaseEntity>(entity: T): Promise<T> {
    const table = this.tableOf(entity);
    if (table.some((e) => e.id === entity.id)) {
      throw new HttpsError("already-exists", `${entity.id} already exists`);
    }

    const cloned = entity.set({});
    Object.assign(cloned, {
      _instanceMeta: {
        ...cloned.instanceMeta,
        isNewEntity: false,
        updatedProps: new Set(),
      },
    });
    table.push(cloned);
    return cloned;
  }

  async update<T extends MyBaseEntity>(entity: T): Promise<T> {
    const table = this.tableOf(entity);
    const beforeIndex = table.findIndex((e) => e.id === entity.id);
    if (beforeIndex < 0) {
      throw new HttpsError("not-found", `${entity.id} not exists`);
    }

    const cloned = entity.set({});
    Object.assign(cloned, {
      _instanceMeta: {
        ...cloned.instanceMeta,
        isNewEntity: false,
        updatedProps: new Set(),
      },
    });
    table[beforeIndex] = cloned;
    return cloned;
  }

  async find<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    options?: FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T[]> {
    const table = this.tableOf(entityClass as any);

    return table
      .filter((e) => {
        if (options?.where == null) return true;

        if (typeof options.where === "string") {
          return e.id === options.where;
        }

        for (const key in options.where as any) {
          const v = (options.where as any)[key];
          if (v != null && (e as any)[key] !== v) {
            return false;
          }
        }

        return true;
      })
      .map((e) => e.set({})) as any;
  }

  async findOne<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    optionsOrId?: string | FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T> {
    const options =
      typeof optionsOrId === "string" ? { where: optionsOrId } : optionsOrId;
    return this.find(entityClass, options).then((arr) => arr[0]);
  }

  async findOneOrFail<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    optionsOrId: string | FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T> {
    const result = await this.findOne(entityClass, optionsOrId);
    if (result == null) {
      throw new HttpsError(
        "not-found",
        `not found: ${JSON.stringify(optionsOrId)}`
      );
    }
    return result;
  }
}
