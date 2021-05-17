import { Tenant } from "../../../1-entities/tenant.entity";
import { TenantContext } from "../tenant-context";

test("TenantContext", () => {
  const context = new TenantContext({});
  const tenant = new Tenant({ name: "Test Tenant", code: "test-tenant" });

  expect(context.hasTenant).toBeFalsy();
  expect(() => context.tenant).toThrow();
  expect(() => context.tenantId).toThrow();

  expect(() => (context.tenant = tenant)).not.toThrow();
  expect(context.hasTenant).toBeTruthy();
  expect(context.tenant).toBe(tenant);
  expect(context.tenantId).toBe(tenant.id);

  expect(
    () => (context.tenant = tenant.set({ name: "Changed" }))
  ).not.toThrow();
  expect(context.tenant.name).toBe("Changed");

  expect(() => (context.tenant = new Tenant({}))).toThrow();
});
