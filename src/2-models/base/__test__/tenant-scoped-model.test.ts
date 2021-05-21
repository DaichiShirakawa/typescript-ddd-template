import { withContext } from "../../../0-base/context";
import { TestBaseEntity } from "../../../1-entities/base/__test__/test-base-entity";
import { TestTenantScopedEntity } from "../../../1-entities/base/__test__/test-tenant-scoped-entity";
import { TestTenantScopedModel } from "./test-tenant-scoped-model";
import { TenantContext } from "../tenant-context";
import { TestTenantContext } from "./test-tenant-context";

test("TenantScopedModel", () =>
  withContext([TestTenantContext], () => {
    const tenant = TenantContext.instance.tenant;
    const be = new TestBaseEntity({ seq: 1 });
    const tenantUnmatchedTe = new TestTenantScopedEntity(tenant.id, { seq: 2 });
    Object.assign(tenantUnmatchedTe, { tenantId: "unknown" });
    const m = new TestTenantScopedModel({ be, tes: [] });

    expect(
      () => new TestTenantScopedModel({ be, tes: [tenantUnmatchedTe] })
    ).toThrow();

    m.addTE({ seq: 3 });
    expect(m.tes.length).toBe(1);
    expect(m.tes[0].seq).toBe(3);
  }));
