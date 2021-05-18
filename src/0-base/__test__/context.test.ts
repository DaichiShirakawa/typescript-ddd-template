import { hasUncaughtExceptionCaptureCallback } from "process";
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

class AnotherContext extends Context<{}> {}

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

test("pick context", () => {
  const source = new TestContext(TestHelper.timeKey());
  const another = new AnotherContext({ source: { context: source } });
  expect(another.has(TestContext)).toBeTruthy();
  expect(another.pick(TestContext)).toBe(source);
  expect(another.has(AnotherContext)).toBeTruthy;
  expect(another.pick(AnotherContext)).toBe(another);
  expect(source.has(AnotherContext)).toBeFalsy();
  expect(source.pick(AnotherContext)).toBeNull();
});
