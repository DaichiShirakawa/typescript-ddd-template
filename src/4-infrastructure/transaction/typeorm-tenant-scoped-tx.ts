import {
  EntityTarget,
  FindConditions,
  FindManyOptions,
  getConnection,
  ObjectLiteral,
} from "typeorm";
import { HttpsError } from "../../0-base/https-error";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { TenantScopedEntity } from "../../1-entities/base/tenant-scoped-entity";
import { TenantContext } from "../../2-models/base/tenant-context";
import {
  ReadonlyTxProcessor,
  TxProcessor,
} from "../../3-services/base/transaction";
import { TypeORMTx } from "./typeorm-tx";

/**
 * TypeORM のトランザクション(EntityManager) をテナントコンテキストに合わせて拡張した Transaction です。
 *
 * - insert/update 後に最新データを select して返すなど、拡張されています
 * - TenantEntity を継承した Entity に対して、自動で tenantId を加味した読み書きを行います
 */
export class TypeORMTenantScopedTx extends TypeORMTx {
  /**
   * models 管理下にあるすべての entities を Save したあとに returns() の結果を返す
   */
  static startTx<R>(func: TxProcessor<R>): Promise<R> {
    return super.startTx(func, TypeORMTenantScopedTx);
  }

  /**
   * 保存系が封じられた Tx
   */
  static async startReadonlyTx<R>(func: ReadonlyTxProcessor<R>): Promise<R> {
    return super.startReadonlyTx(func, TypeORMTenantScopedTx);
  }

  /**
   * 対象がTenantEntity型であるか、
   * またTenantEntityのインスタンスである場合、ContextのTenantに属するものであることを確認します。
   * @param entity
   */
  isTenantEntity<T extends MyBaseEntity>(entity: T | EntityTarget<T>): boolean {
    if (entity instanceof TenantScopedEntity) {
      if (TenantContext.instance.id !== entity.tenantId) {
        throw new HttpsError(
          "internal",
          `This entity not under current context`,
          { context: TenantContext.instance.id, entity }
        );
      }
      return true;
    } else if (entity instanceof MyBaseEntity) {
      return false;
    } else {
      return getConnection()
        .getMetadata(entity)
        .columns.some((col) => col.propertyName === "tenantId");
    }
  }

  /**
   * @param entityClass がTenantEntityでなければwhereをそのまま返します
   * @param where もととなるwhere
   * @returns 必要に応じて現行コンテキストのtenantIdが追加されたwhere
   */
  completeTenantWhere<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    where:
      | string
      | ObjectLiteral
      | FindConditions<T>
      | FindConditions<T>[]
      | undefined
  ):
    | string
    | ObjectLiteral
    | FindConditions<T>
    | FindConditions<T>[]
    | undefined {
    if (!this.isTenantEntity(entityClass)) return where;

    if (typeof where === "string") {
      // 単発IDによるwhereにもtenantIdを付与する
      const col = this.tx
        .getRepository(entityClass)
        .metadata.columns.find(
          (col) => col.propertyName !== "tenantId" && col.isPrimary
        );
      if (col == null) {
        throw new HttpsError(
          "internal",
          `No primary column(without tenantId) for entity ${entityClass}`,
          { entityClass, where }
        );
      }
      return {
        [col.propertyName]: where,
        tenantId: TenantContext.instance.id,
      } as any;
    }

    if (Array.isArray(where)) {
      return where.map((e) => ({
        ...e,
        tenantId: TenantContext.instance.id,
      }));
    }

    return {
      ...(where as any),
      tenantId: TenantContext.instance.id,
    };
  }

  /**
   * insert した後、最新のデータを select して返します
   * @param tx
   * @param entity
   * @returns
   */
  async insert<T extends MyBaseEntity>(entity: T): Promise<T> {
    this.isTenantEntity(entity); // validate
    return super.insert(entity);
  }

  /**
   * update した後、最新のデータを select して返します
   * @param entity
   * @returns
   */
  async update<T extends MyBaseEntity>(entity: T): Promise<T> {
    this.isTenantEntity(entity); // validate
    return super.update(entity);
  }

  /**
   * where 句に tenantId: this.tenantId を付与します。
   */
  find<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    options?: FindManyOptions<Omit<T, "tenantId">>
  ): Promise<T[]> {
    options = { ...options };
    options.where = this.completeTenantWhere(entityClass, options.where);
    return super.find(entityClass, options);
  }

  /**
   * where 句に tenantId: this.tenantId を付与します。
   */
  findOne<T extends MyBaseEntity>(
    entityClass: EntityTarget<T>,
    optionsOrId?: FindManyOptions<Omit<T, "tenantId">> | string
  ): Promise<T | undefined> {
    const isId = typeof optionsOrId === "string";
    const options: FindManyOptions<Omit<T, "tenantId">> = isId
      ? { where: optionsOrId as string }
      : { ...(optionsOrId as any) };
    options.where = this.completeTenantWhere(entityClass, options.where);
    return super.findOne(entityClass, options);
  }

  /**
   * where 句に tenantId: this.tenantId を付与します。
   */
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
