import { Tenant } from "../../../1-entities/tenant.entity";
import { TenantContext } from "../tenant-context";

test("TenantContext", () => {
  const tenant = new Tenant({ name: "Test Tenant", code: "test-tenant" });
  const context = new TenantContext(tenant);

  expect(() => (context.tenant = tenant)).not.toThrow();
  expect(context.tenant).toBe(tenant);
  expect(context.id).toBe(tenant.id);

  expect(
    () => (context.tenant = tenant.set({ name: "Changed" }))
  ).not.toThrow();
  expect(context.tenant.name).toBe("Changed");

  expect(() => (context.tenant = new Tenant({}))).toThrow();
});
