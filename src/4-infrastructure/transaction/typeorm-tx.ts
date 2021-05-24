import {
  EntityManager,
  EntityTarget,
  FindManyOptions,
  getConnection,
} from "typeorm";
import { HttpsError } from "../../0-base/https-error";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import {
  ReadonlyTxProcessor,
  Transaction,
  TxProcessor,
} from "../../3-services/base/transaction";
import { TransactionHelper } from "../../3-services/base/transaction-helper";
import { logs } from "../../0-base/logs-context";

/**
 * TypeORM のトランザクション(EntityManager) を拡張した Transaction です。
 * すべてのデータへアクセスすることができます。
 *
 * - insert/update 後に最新データを select して返すなど、拡張されています
 * - セーブ対象のモデルが持つサブモデルも含めすべてのentityをセーブするなどできます
 */
export class TypeORMTx extends Transaction {
  protected readonly tx: EntityManager;

  constructor(isReadonly: boolean, tx: EntityManager) {
    super(isReadonly);
    this.tx = tx;
  }

  /**
   * models 管理下にあるすべての entities を Save したあとに returns() の結果を返す
   */
  static async startTx<R>(
    func: TxProcessor<R>,
    txOrTxClass:
      | Transaction
      | (new (isReadonly: boolean, tx: EntityManager) => TypeORMTx) = TypeORMTx
  ): Promise<R> {
    const qr = getConnection().createQueryRunner();
    try {
      logs().debug(
        `Start ${(txOrTxClass as any).name || txOrTxClass.constructor.name}`
      );
      await qr.startTransaction();

      const tx =
        txOrTxClass instanceof Transaction
          ? txOrTxClass
          : new txOrTxClass(false, qr.manager);

      const result = await super.startTx(func, tx, async () => {
        logs().debug(
          `Commit ${(txOrTxClass as any).name || txOrTxClass.constructor.name}`
        );
        await qr.commitTransaction();
      });

      return result;
    } catch (e) {
      logs().debug(
        `Rollback ${(txOrTxClass as any).name || txOrTxClass.constructor.name}`
      );
      await qr.rollbackTransaction().catch();
      throw e;
    } finally {
      await qr.release().catch();
    }
  }

  /**
   * 保存系が封じられた Tx
   */
  static async startReadonlyTx<R>(
    func: ReadonlyTxProcessor<R>,
    txOrTxClass:
      | Transaction
      | (new (isReadonly: boolean, tx: EntityManager) => TypeORMTx) = TypeORMTx
  ): Promise<R> {
    const qr = getConnection().createQueryRunner();
    try {
      logs().debug(
        `Start READONLY ${
          (txOrTxClass as any).name || txOrTxClass.constructor.name
        }`
      );

      await qr.startTransaction();

      const tx =
        txOrTxClass instanceof Transaction
          ? txOrTxClass
          : new txOrTxClass(true, qr.manager);

      return await super.startReadonlyTx(func, tx);
    } finally {
      logs().debug(
        `Rollback READONLY ${
          (txOrTxClass as any).name || txOrTxClass.constructor.name
        }`
      );
      await qr.rollbackTransaction().catch();
      await qr.release().catch();
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
      relations: TransactionHelper.toContainsRelations(entity),
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
    return await this.tx.findOneOrFail(entity.constructor, {
      where,
      relations: TransactionHelper.toContainsRelations(entity),
    });
  }

  find<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    options?: FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T[]> {
    options = { ...options };
    return this.tx.find(entityClass, options) as Promise<T[]>;
  }

  findOne<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    optionsOrId?: FindManyOptions<Omit<T, "tenantId">> | string
  ): Promise<T | undefined> {
    const isId = typeof optionsOrId === "string";
    const options: FindManyOptions<Omit<T, "tenantId">> = isId
      ? { where: this.completeWhereFromId(entityClass, optionsOrId as string) }
      : { ...(optionsOrId as any) };
    return this.tx.findOne(entityClass, options) as Promise<T>;
  }

  private completeWhereFromId<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    id: string
  ) {
    const primaryCols = this.tx
      .getRepository(entityClass)
      .metadata.columns.filter((col) => col.isPrimary);
    if (1 !== primaryCols.length) {
      throw new HttpsError(
        "internal",
        `Can not set {where:${id}} / Zero or multiple PrimaryColumn defined in ${
          (entityClass as any).name
        }`
      );
    }

    return { [primaryCols[0].propertyName]: id };
  }

  async findOneOrFail<T extends MyBaseEntity>(
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
