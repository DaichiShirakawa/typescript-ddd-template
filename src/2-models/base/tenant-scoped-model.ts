import { Tenant } from "../../1-entities/tenant.entity";
import { HttpsError } from "../../0-definitions/https-error";
import { BaseModel, ModelDependencies } from "./base-model";
import { ModelHelper } from "./model-helper";
import { TenantContext, TenantContextHolder } from "./tenant-context";

/**
 * Tenant 配下のデータを扱うことに特化した Model
 * TenantContext を保有
 */
export abstract class TenantScopedModel<
  D extends ModelDependencies
> extends BaseModel<TenantContext, D> {
  constructor(ch: TenantContextHolder, dependencies: D) {
    super(ch, dependencies);

    const errors = ModelHelper.toEntitiesArray(this).filter(
      (e) => "tenantId" in e && e["tenantId"] !== this.context.tenantId
    );

    if (errors.length) {
      throw new HttpsError(
        "failed-precondition",
        `Invalid resources: tenantId not matches`,
        {
          expected: this.tenantId,
          errors,
        }
      );
    }
  }

  get tenant() {
    return this.context.tenant;
  }

  get tenantId() {
    return this.context.tenant.tenantId;
  }

  /**
   * Tenant を update した場合、 context の内容も更新します
   */
  protected update<K extends keyof D>(name: K, updated: D[K]): D[K] {
    if (updated instanceof Tenant) {
      this.context.tenant = updated as any;
    }
    return super.update(name, updated);
  }
}
