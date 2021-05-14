import { FindConditions, getConnection } from "typeorm";
import { MyBaseEntity } from "../1-entities/_base-entity";

export class ORMHelper {
  /**
   * entity の @PrimaryKey を自動検出して where 句に詰めます
   * @param entity
   * @returns
   */
  static toPrimaryWhere<T extends MyBaseEntity<any>>(
    entity: T
  ): FindConditions<T> {
    const meta = getConnection().getMetadata(entity.constructor);
    const where: FindConditions<T> = {};
    for (const col of meta.columns.filter((col) => col.isPrimary)) {
      (where as any)[col.propertyName] = (entity as any)[col.propertyName];
    }
    return where;
  }

  static convertFrontEntityRecursively(data: any): any {
    if (data == null) {
      return data;
    } else if (data instanceof MyBaseEntity) {
      return data.asResponseEntity;
    } else if (data.constructor === [].constructor) {
      return data.map(ORMHelper.convertFrontEntityRecursively);
    } else if (data.constructor === {}.constructor) {
      for (const key in data) {
        data[key] = ORMHelper.convertFrontEntityRecursively(data[key]);
      }
      return data;
    } else {
      return data;
    }
  }
}
