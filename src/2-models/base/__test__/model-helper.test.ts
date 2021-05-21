import { withContext } from "../../../0-base/context";
import { TestBaseEntity } from "../../../1-entities/base/__test__/test-base-entity";
import { TestTenantScopedEntity } from "../../../1-entities/base/__test__/test-tenant-scoped-entity";
import { ModelHelper } from "../model-helper";
import { TenantContext } from "../tenant-context";
import { TestNestedModel } from "./test-nested-model";
import { TestTenantContext } from "./test-tenant-context";

describe("ModelHelper", () => {
  test("ModelHelper", () =>
    withContext([TestTenantContext], () => {
      const tenant = TenantContext.instance.tenant;

      const m = new TestNestedModel({
        alpha: new TestBaseEntity({ seq: 1 }),
        betas: [
          new TestTenantScopedEntity(tenant.id, { seq: 2 }),
          new TestTenantScopedEntity(tenant.id, { seq: 3 }),
        ],
        gannma: new TestTenantScopedEntity(tenant.id, { seq: 4 }),
        deltas: [
          new TestTenantScopedEntity(tenant.id, { seq: 5 }),
          new TestTenantScopedEntity(tenant.id, { seq: 6 }),
        ],
      });

      expect(ModelHelper.toEntitiesArray(m).length).toBe(6);
      m.addBetaEntities({ seq: 7 });
      m.addDeltaModel({ seq: 8 });
      expect(ModelHelper.toEntitiesArray(m).length).toBe(8);
    }));
});
