import { TestBaseEntity } from "../../../1-entities/base/__test__/test-base-entity";
import { TestTenantScopedEntity } from "../../../1-entities/base/__test__/test-tenant-scoped-entity";
import { TenantScopedModel } from "../tenant-scoped-model";

type D = {
  be: TestBaseEntity;
  tes: TestTenantScopedEntity[];
};

export class TestTenantScopedModel extends TenantScopedModel<D> implements D {
  get id() {
    return this.be.id;
  }

  get be() {
    return this.dependencies.be;
  }

  get tes() {
    return this.dependencies.tes;
  }

  addTE(init: Pick<TestTenantScopedEntity, "seq">) {
    this.add("tes", new TestTenantScopedEntity(this.tenantId, init));
    return this;
  }
}
