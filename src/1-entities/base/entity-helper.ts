import { getRepository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { MyBaseEntity } from "./base-entity";

export class EntityHelper {
  /**
   * Save すべきプロパティに絞ったオブジェクトを返す
   *
   * そのまま Entity 全体を指定して Update すると、
   * UpdatedAtColumn 等意図しないフィールドまで含まれるため、
   * Save する場合はこれを用いる。
   */
  static asSaveEntity<E extends MyBaseEntity>(
    entity: E
  ): QueryDeepPartialEntity<E> {
    const { columns } = getRepository(entity.constructor).metadata;
    const result: any = {};

    for (const col of columns) {
      if (col.isCreateDate || col.isUpdateDate) {
        continue;
      }
      if (
        entity.isNeedInsert ||
        entity.updatedPropNames?.includes(col.propertyName)
      ) {
        result[col.propertyName] = (entity as any)[col.propertyName];
      }
    }

    return result;
  }

  /**
   * API の外側に返すEntityに変換
   * 内部管理用フィールドを含まず、純粋なColumnのみ含むようになる
   */
  static asAPIResponse<E extends MyBaseEntity>(entity: E): E {
    const { columns } = getRepository(this.constructor).metadata;
    const result: any = {};

    for (const column of columns) {
      let value = (this as any)[column.propertyName];
      result[column.propertyName] = value;
    }

    return result;
  }
}
