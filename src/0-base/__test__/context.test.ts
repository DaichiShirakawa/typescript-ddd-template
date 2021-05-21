import { Context } from "../context";
import { ContextHolder } from "../context-holder";
import { TestHelper } from "./test-helper";

class TestContext extends Context {
  constructor(readonly testName: string) {
    super();
  }
}

class AnotherContext extends Context {}

describe("Context", () => {
  test("dataset", () => {
    const testName = TestHelper.timeKey();
    const context = new TestContext(testName);
    expect(context.testName).toBe(testName);
  });
});

describe("ContextHolder", () => {
  test("initialize", () => {
    ContextHolder.startSession();
    ContextHolder.endSession();
  });

  test("set", () => {
    expect(() => ContextHolder.set(new TestContext("test"))).toThrow();
    ContextHolder.startSession();
    expect(ContextHolder.set(new TestContext("test"))).toBeDefined();
    expect(() => ContextHolder.set(new TestContext("test"))).toThrow();
    ContextHolder.endSession();
  });

  test("getOrNull", () => {
    expect(() => ContextHolder.getOrNull(TestContext)).toThrow();
    ContextHolder.startSession();

    expect(ContextHolder.getOrNull(TestContext)).toBe(null);
    ContextHolder.set(new TestContext("test"));
    const c = ContextHolder.getOrNull(TestContext);
    expect(c).toBeInstanceOf(TestContext);
    expect(ContextHolder.getOrNull(AnotherContext)).toBeNull();
    ContextHolder.endSession();
  });

  test("get", () => {
    expect(() => ContextHolder.get(TestContext)).toThrow();
    ContextHolder.startSession();

    expect(() => ContextHolder.get(TestContext)).toThrow();
    ContextHolder.set(new TestContext("test"));
    expect(ContextHolder.get(TestContext)).toBeInstanceOf(TestContext);
    expect(() => ContextHolder.get(AnotherContext)).toThrow();
    ContextHolder.endSession();
  });

  test("has", () => {
    expect(() => ContextHolder.has(TestContext)).toThrow();
    ContextHolder.startSession();

    expect(ContextHolder.has(TestContext)).toBeFalsy();
    ContextHolder.set(new TestContext("test"));
    expect(ContextHolder.has(TestContext)).toBeTruthy();
    expect(ContextHolder.has(AnotherContext)).toBeFalsy();
    ContextHolder.endSession();
  });

  test("assertEmpty", () => {
    expect(() => ContextHolder.assertEmpty(TestContext)).toThrow();
    ContextHolder.startSession();

    expect(() => ContextHolder.assertEmpty(TestContext)).not.toThrow();
    ContextHolder.set(new TestContext("test"));
    expect(() => ContextHolder.assertEmpty(TestContext)).toThrow();
    expect(() => ContextHolder.assertEmpty(AnotherContext)).not.toThrow();
    ContextHolder.endSession();
  });
});
