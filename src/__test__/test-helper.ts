import { DateTime } from "luxon";

export class TestHelper {
  static timeKey(prefix: string = "") {
    prefix = prefix ? prefix + "_" : prefix;
    return prefix + DateTime.now().toFormat("yyyyMMddHHmmss");
  }

  static async wait(wait_ms: number) {
    await new Promise((resolve) => setTimeout(resolve, wait_ms));
  }
}
