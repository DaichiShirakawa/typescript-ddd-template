import {
  EntityTarget,
  FindConditions,
  FindManyOptions,
  getConnection,
  getRepository,
  ObjectLiteral,
} from "typeorm";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { TenantScopedEntity } from "../../1-entities/base/tenant-scoped-entity";
import {
  TenantContext,
  TenantContextHolder,
} from "../../2-models/base/tenant-context";
import { TxProcessor } from "../../3-services/base/transaction";
import { HttpsError } from "../../0-definitions/https-error";
import { TypeORMTx } from "./typeorm-tx";
import { TypeORMHelper } from "./typeorm-helper";

/**
 * TypeORM のトランザクション(EntityManager) をテナントコンテキストに合わせて拡張した Transaction です。
 *
 * - insert/update 後に最新データを select して返すなど、拡張されています
 * - TenantEntity を継承した Entity に対して、自動で tenantId を加味した読み書きを行います
 */
export class TypeORMTenantScopedTx extends TypeORMTx<TenantContext> {
  /**
   * 対象がTenantEntity型であるか、
   * またTenantEntityのインスタンスである場合、ContextのTenantに属するものであることを確認します。
   * @param entity
   */
  isTenantEntity<T extends MyBaseEntity<any>>(
    entity: T | EntityTarget<T>
  ): boolean {
    if (entity instanceof TenantScopedEntity) {
      if (this.context.hasTenant && entity.tenantId !== this.context.tenantId) {
        throw new HttpsError(
          "internal",
          `This entity not under current context`,
          { context: this.context.tenantId, entity }
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
  completeTenantWhere<T extends MyBaseEntity<any>>(
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
      const col = getRepository(entityClass).metadata.columns.find(
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
        tenantId: this.context.tenantId,
      } as any;
    }

    if (Array.isArray(where)) {
      return where.map((e) => ({
        ...e,
        tenantId: this.context.tenantId,
      }));
    }

    return {
      ...(where as any),
      tenantId: this.context.tenantId,
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
  find<T extends MyBaseEntity<any>>(
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
  findOne<T extends MyBaseEntity<any>>(
    entityClass: EntityTarget<T>,
    optionsOrId?: FindManyOptions<Omit<T, "tenantId">> | string
  ): Promise<T | undefined> {
    const isId = typeof optionsOrId === "string";
    const options: FindManyOptions<Omit<T, "tenantId">> = isId
      ? { where: optionsOrId as string }
      : { ...(optionsOrId as any) };
    options.where = this.completeTenantWhere(entityClass, options.where);
    return super.findOne(entityClass, optionsOrId);
  }

  /**
   * where 句に tenantId: this.tenantId を付与します。
   */
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
