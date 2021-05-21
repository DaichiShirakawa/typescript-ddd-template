import { MyBaseEntity } from "../../../1-entities/base/base-entity";
import { BaseModel } from "../base-model";
import { TestBaseEntity } from "../../../1-entities/base/__test__/test-base-entity";

export class TestAnotherEntity extends MyBaseEntity {
  get id() {
    return "another";
  }
}

type D = {
  e: TestBaseEntity;
  empty?: TestAnotherEntity;
  array: TestBaseEntity[];
};

export class TestBaseModel extends BaseModel<D> {
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

  static register(init: Pick<TestBaseEntity, "seq">) {
    return new TestBaseModel({
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
    this.set("empty", new TestAnotherEntity({}));
  }

  addArray() {
    this.add("array", new TestBaseEntity({ seq: 100 + this.array.length }));
  }
}
