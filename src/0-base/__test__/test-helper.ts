import { DateTime } from "luxon";

export class TestHelper {
  static timeKey(prefix: string = "") {
    return prefix + DateTime.now().toFormat("yyyyMMddHHmmss");
  }
}
