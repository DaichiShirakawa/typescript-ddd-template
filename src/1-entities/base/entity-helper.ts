import { MyBaseEntity } from "./base-entity";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { getRepository } from "typeorm";

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
}
