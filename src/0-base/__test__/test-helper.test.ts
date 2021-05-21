import { wait } from "../wait";
import { TestHelper } from "./test-helper";

test("TestHelper", () => {
  expect(TestHelper.timeKey("prefix_")).toMatch(/prefix_\d{14}/);
  expect(wait(1000)).toBeInstanceOf(Promise);
});
