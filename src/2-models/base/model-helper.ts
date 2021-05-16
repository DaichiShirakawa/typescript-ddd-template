import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { BaseModel } from "./base-model";

export class ModelHelper {
  /**
   * @returns Model の管理下にある全ての Entities
   * Sub Model 配下の Entities も含む
   */
  static toEntitiesArray(model: BaseModel): ReadonlyArray<MyBaseEntity> {
    const result: MyBaseEntity[] = [];
    const dependencies = model.dependencies;

    const push = (target: BaseModel | MyBaseEntity) => {
      if (target instanceof BaseModel) {
        result.push(...ModelHelper.toEntitiesArray(target));
      } else if (target instanceof MyBaseEntity) {
        result.push(target);
      } else {
        // no-op
      }
    };

    for (const data of Object.values(dependencies) as any[]) {
      if (Array.isArray(data)) {
        for (const each of data) {
          push(each);
        }
      } else {
        push(data);
      }
    }

    return Object.freeze(result);
  }
}
