import { Column } from "typeorm";
import { v4 } from "uuid";
import { TestHelper } from "../../../0-definitions/__test__/test-helper.test";
import { TenantScopedEntity } from "../tenant-scoped-entity";

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
});
