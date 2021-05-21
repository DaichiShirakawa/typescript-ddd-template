import { TestBaseEntity } from "../../../1-entities/base/__test__/test-base-entity";
import { TestTenantScopedEntity } from "../../../1-entities/base/__test__/test-tenant-scoped-entity";
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
  constructor(init: {
    alpha: TestBaseEntity;
    betas: TestTenantScopedEntity[];
    gannma: TestTenantScopedEntity;
    deltas: TestTenantScopedEntity[];
  }) {
    super({
      alphaEntity: init.alpha,
      betaEntities: init.betas,
      gannmaModel: new _Model({ e: init.gannma }),
      deltaModels: init.deltas.map((e) => new _Model({ e })),
    });
  }

  get id() {
    return this.alphaEntity.id;
  }

  get alphaEntity() {
    return this.dependencies.alphaEntity;
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
    const model = new _Model({
      e: new TestTenantScopedEntity(this.tenantId, init),
    });
    this.add("deltaModels", model);
    return model;
  }
}
