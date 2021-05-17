import {
  EntityManager,
  EntityTarget,
  FindManyOptions,
  getConnection,
} from "typeorm";
import { Context, ContextHolder } from "../../0-base/context";
import { HttpsError } from "../../0-base/https-error";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import {
  ReadonlyTxProcessor,
  Transaction,
  TxProcessor,
} from "../../3-services/base/transaction";
import { TransactionHelper } from "../../3-services/base/transaction-helper";

/**
 * TypeORM のトランザクション(EntityManager) を拡張した Transaction です。
 * すべてのデータへアクセスすることができます。
 *
 * - insert/update 後に最新データを select して返すなど、拡張されています
 * - セーブ対象のモデルが持つサブモデルも含めすべてのentityをセーブするなどできます
 */
export class TypeORMTx<C extends Context = Context> extends Transaction<C> {
  protected readonly tx: EntityManager;

  constructor(ch: ContextHolder<C>, isReadonly: boolean, tx: EntityManager) {
    super(ch, isReadonly);
    this.tx = tx;
  }

  /**
   * models 管理下にあるすべての entities を Save したあとに returns() の結果を返す
   */
  static async startTx<R>(
    ch: ContextHolder,
    func: TxProcessor<R>,
    txOrTxClass:
      | Transaction
      | (new (
          ch: ContextHolder,
          isReadonly: boolean,
          tx: EntityManager
        ) => TypeORMTx) = TypeORMTx
  ): Promise<R> {
    const qr = getConnection().createQueryRunner();
    try {
      console.log(`Start ${txOrTxClass.constructor.name}`);
      await qr.startTransaction();

      const tx =
        txOrTxClass instanceof Transaction
          ? txOrTxClass
          : new txOrTxClass(ch, false, qr.manager);

      const result = await super.startTx(ch, func, tx, async () => {
        console.log(`Commit ${txOrTxClass.constructor.name}`);
        await qr.commitTransaction();
      });

      return result;
    } catch (e) {
      console.log(`Rollback ${txOrTxClass.constructor.name}`);
      await qr.rollbackTransaction().catch();
      throw e;
    }
  }

  /**
   * 保存系が封じられた Tx
   */
  static async startReadonlyTx<R>(
    ch: ContextHolder,
    func: ReadonlyTxProcessor<R>,
    txOrTxClass:
      | Transaction
      | (new (
          ch: ContextHolder,
          isReadonly: boolean,
          tx: EntityManager
        ) => TypeORMTx) = TypeORMTx
  ): Promise<R> {
    const qr = getConnection().createQueryRunner();
    try {
      console.log(`Start READONLY ${txOrTxClass.constructor.name}`);

      await qr.startTransaction();

      const tx =
        txOrTxClass instanceof Transaction
          ? txOrTxClass
          : new txOrTxClass(ch, true, qr.manager);

      return super.startReadonlyTx(ch, func, tx);
    } catch (e) {
      throw e;
    } finally {
      console.log(`Rollback READONLY ${txOrTxClass.constructor.name}`);
      await qr.rollbackTransaction().catch();
    }
  }

  /**
   * insert した後、最新のデータを select して返します
   */
  async insert<T extends MyBaseEntity>(entity: T): Promise<T> {
    if (this.isReadonly) {
      throw new HttpsError("internal", `Read only transaction`);
    }
    const saveEntity = TransactionHelper.asSaveEntity(entity);
    await this.tx.insert(entity.constructor, saveEntity);
    return await this.tx.findOneOrFail(entity.constructor, {
      where: TransactionHelper.toPrimaryWhere(entity),
    });
  }

  /**
   * update した後、最新のデータを select して返します
   */
  async update<T extends MyBaseEntity>(entity: T): Promise<T> {
    if (this.isReadonly) {
      throw new HttpsError("internal", `Read only transaction`);
    }
    const saveEntity = TransactionHelper.asSaveEntity(entity);
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
}