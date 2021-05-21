import { getRepository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { MyBaseEntity } from "./base-entity";

export class EntityHelper {
  /**
   * Column として定義されたプロパティに絞ったオブジェクトを返す
   * logに吐く、JSONにする等の用途を想定
   */
  static pickColumns<E extends MyBaseEntity>(
    entity: E
  ): QueryDeepPartialEntity<E> {
    const { columns } = getRepository(entity.constructor).metadata;
    const result: any = {};

    for (const col of columns) {
      result[col.propertyName] = (entity as any)[col.propertyName];
    }

    return result;
  }

  /**
   * Column として定義されたプロパティに絞ったオブジェクトを返す
   * logに吐く、JSONにする等の用途を想定
   */
  static pickColumnsAndRelations<E extends MyBaseEntity>(
    entity: E
  ): QueryDeepPartialEntity<E> {
    const result: any = EntityHelper.pickColumns(entity);
    const { relations } = getRepository(entity.constructor).metadata;

    for (const relation of relations) {
      result[relation.propertyName] = EntityHelper.pickColumnsAndRelations(
        (entity as any)[relation.propertyName]
      );
    }

    return result;
  }
}
