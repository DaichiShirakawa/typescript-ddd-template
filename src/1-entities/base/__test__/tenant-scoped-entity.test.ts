import { Column } from "typeorm";
import { v4 } from "uuid";
import { TenantScopedEntity } from "../tenant-scoped-entity";
import { TestHelper } from "../../../0-base/__test__/test-helper.test";

export class TestTenantScopedEntity extends TenantScopedEntity<TestTenantScopedEntity> {
  @Column()
  readonly id: string = `test_${v4()}`;
  @Column()
  readonly seq: number;
}

test("TenantScopedEntity", () => {
  const tenantId = TestHelper.timeKey("tenant_");

  const e1 = new TestTenantScopedEntity(tenantId, { seq: 1 });
  expect(e1.tenantId).toBe(tenantId);

  expect(() => e1.set({ tenantId: "updated" } as any)).toThrow();
});
