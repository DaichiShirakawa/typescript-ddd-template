import { TestBaseEntity } from "../../../1-entities/base/__test__/base-entity.test";
import { TestTenantScopedEntity } from "../../../1-entities/base/__test__/tenant-scoped-entity.test";
import { Tenant } from "../../../1-entities/tenant.entity";
import { ModelHelper } from "../model-helper";
import { TenantContext, TenantContextHolder } from "../tenant-context";
import { TenantScopedModel } from "../tenant-scoped-model";

class _Model extends TenantScopedModel<{ e: TestTenantScopedEntity }> {
  get id() {
    return this.dependencies.e.id;
  }

  increment() {
    this.update(this.dependencies.e.set({ seq: this.dependencies.e.seq + 1 }));
  }
}

type D = {
  alphaEntity: TestBaseEntity;
  betaEntities: TestTenantScopedEntity[];
  gannmaModel: _Model;
  deltaModels: _Model[];
};

export class TestNestedModel extends TenantScopedModel<D> implements D {
  constructor(
    ch: TenantContextHolder,
    init: {
      alpha: TestBaseEntity;
      betas: TestTenantScopedEntity[];
      gannma: TestTenantScopedEntity;
      deltas: TestTenantScopedEntity[];
    }
  ) {
    super(ch, {
      alphaEntity: init.alpha,
      betaEntities: init.betas,
      gannmaModel: new _Model(ch, { e: init.gannma }),
      deltaModels: init.deltas.map((e) => new _Model(ch, { e })),
    });
  }

  get id() {
    return this.alphaEntity.id;
  }

  get alphaEntity() {
    return this.alphaEntity;
  }

  get betaEntities() {
    return this.dependencies.betaEntities;
  }

  get gannmaModel() {
    return this.dependencies.gannmaModel;
  }

  get deltaModels() {
    return this.dependencies.deltaModels;
  }

  incrementAlphaEntity() {
    this.update(this.alphaEntity.set({ seq: this.alphaEntity.seq + 1 }));
  }

  addBetaEntities(init: Pick<TestTenantScopedEntity, "seq">) {
    const entity = new TestTenantScopedEntity(this.tenantId, init);
    this.add("betaEntities", entity);
    return entity;
  }

  incrementGannmaModel() {
    this.gannmaModel.increment();
    return this;
  }

  addDeltaModel(init: Pick<TestTenantScopedEntity, "seq">) {
    const model = new _Model(this, {
      e: new TestTenantScopedEntity(this.tenantId, init),
    });
    this.add("deltaModels", model);
    return model;
  }
}

test("ModelHelper", () => {
  const tenant = new Tenant({ name: "Test Tenant", code: "test-tenant" });
  const ch = { context: new TenantContext({ tenant }) };
  const m = new TestNestedModel(ch, {
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
});
