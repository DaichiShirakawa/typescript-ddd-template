import { getRepository } from "typeorm";
import { MyBaseEntity } from "../../1-entities/base/base-entity";

export class ExpressHelper {
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

  static convertEntityRecursively(data: any): any {
    if (data == null) {
      return data;
    } else if (data instanceof MyBaseEntity) {
      return ExpressHelper.asAPIResponse(data);
    } else if (data.constructor === [].constructor) {
      return data.map(ExpressHelper.convertEntityRecursively);
    } else if (data.constructor === {}.constructor) {
      for (const key in data) {
        data[key] = ExpressHelper.convertEntityRecursively(data[key]);
      }
      return data;
    } else {
      return data;
    }
  }
}
