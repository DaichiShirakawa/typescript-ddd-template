import { Context, ContextHolder } from "../context";
import { TestHelper } from "./test-helper.test";

export class TestContext extends Context<{ testName: string }> {
  constructor(testName: string, source?: ContextHolder) {
    super({ testName, source });
  }

  get testName() {
    return this.dataset.testName;
  }
}

test("context with no source", () => {
  const testName = TestHelper.timeKey();
  const context = new TestContext(testName);

  expect(context.hasSource).toBeFalsy();
  expect(() => context.source).toThrow();
  expect(context.testName).toBe(testName);
});

test("context with source", () => {
  const source = new TestContext(TestHelper.timeKey());
  const context = new TestContext(TestHelper.timeKey(), { context: source });

  expect(context.hasSource).toBeTruthy();
  expect(() => context.source).toBeDefined();
});
