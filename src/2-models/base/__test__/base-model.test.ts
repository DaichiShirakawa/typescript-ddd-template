import { TestContext } from "../../../0-definitions/__test__/context.test";
import { TestBaseEntity } from "../../../1-entities/base/__test__/base-entity.test";
import { BaseModel } from "../base-model";
import { ContextHolder } from "../../../0-definitions/context";

type D = {
  e: TestBaseEntity;
};

export class TestBaseModel extends BaseModel<TestContext, D> implements D {
  get e() {
    return this.dependencies.e;
  }

  static register(
    ch: ContextHolder<TestContext>,
    init: Pick<TestBaseEntity, "seq">
  ) {
    return new TestBaseModel(ch, { e: new TestBaseEntity(init) });
  }

  incrementSeq() {
    this.update("e", this.e.set({ seq: this.e.seq + 1 }));
    return this;
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
});
