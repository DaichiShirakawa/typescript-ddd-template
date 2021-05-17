import { DateTime } from "luxon";

export class TestHelper {
  static timeKey(prefix: string = "") {
    return prefix + DateTime.now().toFormat("yyyyMMddHHmmss");
  }

  static async wait(wait_ms: number) {
    await new Promise((resolve) => setTimeout(resolve, wait_ms));
  }
}

test("TestHelper", () => {
  expect(TestHelper.timeKey("prefix_")).toMatch(/prefix_\d{14}/);
  expect(TestHelper.wait(1000)).toBeInstanceOf(Promise);
});
