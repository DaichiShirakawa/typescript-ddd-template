import { TenantModel } from "../../tenant.model";

export const TestTenantContext = TenantModel.register({
  name: "Test Tenant",
  code: "test-tenant",
}).context;
