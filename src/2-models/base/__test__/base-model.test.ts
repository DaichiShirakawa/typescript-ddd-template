import { TestBaseModel } from "./test-base-model";

test("BaseModel", () => {
  const m = TestBaseModel.register({ seq: 1 });
  const e1 = m.e;
  const e2 = e1.set({ seq: 2 });

  expect(() => ((m.dependencies as any).e = e2)).toThrow();
  expect(m.e.seq).toBe(1);
  expect(m.incrementSeq()).toBe(m);
  expect(m.e.seq).toBe(2);
  expect(m.e).not.toBe(e2);

  expect(() => m.setEmpty()).not.toThrow();
  expect(m.empty).not.toBeNull();
  expect(() => m.setEmpty()).toThrow();

  expect(m.array.length).toBe(0);
  m.addArray();
  m.addArray();
  m.addArray();
  expect(m.array.length).toBe(3);
});
