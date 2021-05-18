import { ContextHolder } from "../../../0-base/context";
import { TestContext } from "../../../0-base/__test__/context.test";
import { MyBaseEntity } from "../../../1-entities/base/base-entity";
import { TestBaseEntity } from "../../../1-entities/base/__test__/base-entity.test";
import { BaseModel } from "../base-model";

class AnotherEntity extends MyBaseEntity {
  get id() {
    return "another";
  }
}

type D = {
  e: TestBaseEntity;
  empty?: AnotherEntity;
  array: TestBaseEntity[];
};

export class TestBaseModel extends BaseModel<TestContext, D> {
  get id() {
    return this.e.id;
  }

  get e() {
    return this.dependencies.e;
  }

  get empty() {
    return this.dependencies.empty;
  }

  get array() {
    return this.dependencies.array;
  }

  static register(
    ch: ContextHolder<TestContext>,
    init: Pick<TestBaseEntity, "seq">
  ) {
    return new TestBaseModel(ch, {
      e: new TestBaseEntity(init),
      empty: undefined,
      array: [],
    });
  }

  incrementSeq() {
    this.update(this.e.set({ seq: this.e.seq + 1 }));
    return this;
  }

  setEmpty() {
    this.set("empty", new AnotherEntity({}));
  }

  addArray() {
    this.add("array", new TestBaseEntity({ seq: 100 + this.array.length }));
  }
}

test("BaseModel", () => {
  const ch = { context: new TestContext("BaseModel") };
  const m = TestBaseModel.register(ch, { seq: 1 });
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
