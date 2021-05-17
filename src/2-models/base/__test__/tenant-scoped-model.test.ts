import { TestBaseEntity } from "../../../1-entities/base/__test__/base-entity.test";
import { TestTenantScopedEntity } from "../../../1-entities/base/__test__/tenant-scoped-entity.test";
import { Tenant } from "../../../1-entities/tenant.entity";
import { TenantContext } from "../tenant-context";
import { TenantScopedModel } from "../tenant-scoped-model";

type D = {
  be: TestBaseEntity;
  tes: TestTenantScopedEntity[];
};

export class TestTenantScopedModel extends TenantScopedModel<D> implements D {
  get be() {
    return this.dependencies.be;
  }

  get tes() {
    return this.dependencies.tes;
  }

  addTE(init: Pick<TestTenantScopedEntity, "seq">) {
    this.update("tes", [
      ...this.tes,
      new TestTenantScopedEntity(this.tenantId, init),
    ]);
    return this;
  }
}

test("TenantScopedModel", () => {
  const tenant = new Tenant({ name: "Test Tenant", code: "test-tenant" });

  const ch = { context: new TenantContext({ tenant }) };
  const be = new TestBaseEntity({ seq: 1 });
  const tenantUnmatchedTe = new TestTenantScopedEntity("dummy-tenant", {
    seq: 2,
  });
  const m = new TestTenantScopedModel(ch, { be, tes: [] });

  expect(
    () => new TestTenantScopedModel(ch, { be, tes: [tenantUnmatchedTe] })
  ).toThrow();

  m.addTE({ seq: 3 });
  expect(m.tes.length).toBe(1);
  expect(m.tes[0].seq).toBe(3);
});
