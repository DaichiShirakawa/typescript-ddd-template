import { Column } from "typeorm";
import { v4 } from "uuid";
import { MyBaseEntity } from "../base-entity";

export class TestBaseEntity extends MyBaseEntity<TestBaseEntity> {
  @Column()
  readonly id: string = `test_${v4()}`;
  @Column()
  readonly seq: number;
}

test("MyBaseEntity", () => {
  const e1 = new TestBaseEntity({ seq: 1 });
  expect(e1.seq).toBe(1);
  expect(e1.instanceMeta.isNewEntity).toBeTruthy();
  expect(e1.instanceMeta.updatedProps.size).toBe(0);

  const e2 = e1.set({ seq: 2 });
  expect(e2).not.toBe(e1);
  expect(e2.id).toBe(e1.id);
  expect(e2.seq).toBe(2);
  expect(e2.instanceMeta.instanceSeq).toBeGreaterThan(
    e1.instanceMeta.instanceSeq
  );
  expect(e2.instanceMeta.isNewEntity).toBeTruthy();
  expect(e2.instanceMeta.updatedProps.has("seq"));
});
