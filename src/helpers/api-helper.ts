import { MyBaseEntity } from "../1-entities/base/base-entity";
import { EntityHelper } from "../1-entities/base/entity-helper";

export class APIHelper {
  static convertFrontEntityRecursively(data: any): any {
    if (data == null) {
      return data;
    } else if (data instanceof MyBaseEntity) {
      return EntityHelper.asAPIResponse(data);
    } else if (data.constructor === [].constructor) {
      return data.map(APIHelper.convertFrontEntityRecursively);
    } else if (data.constructor === {}.constructor) {
      for (const key in data) {
        data[key] = APIHelper.convertFrontEntityRecursively(data[key]);
      }
      return data;
    } else {
      return data;
    }
  }
}
