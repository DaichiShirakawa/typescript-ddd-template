import { TestHelper } from "../../../0-base/__test__/test-helper";
import { Tenant } from "../../tenant.entity";
import { TestTenantScopedEntity } from "./test-tenant-scoped-entity";

describe("TenantScopedEntity", () => {
  const tenant = new Tenant({
    name: "test",
    code: TestHelper.timeKey("code_"),
  });

  test("constructor", () => {
    expect(
      () => new TestTenantScopedEntity(tenant.id, { seq: 1 })
    ).toBeDefined();
  });

  test("set", () => {
    const e = new TestTenantScopedEntity(tenant.id, { seq: 1 });
    expect(e.tenantId).toBe(tenant.id);
    expect(() => e.set({ tenantId: "updated" } as any)).toThrow();
  });
});
