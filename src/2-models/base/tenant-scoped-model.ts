import { HttpsError } from "../../0-base/https-error";
import { ArrayElement, NonArrayElement } from "../../0-base/type-helper";
import { TenantScopedEntity } from "../../1-entities/base/tenant-scoped-entity";
import { Tenant } from "../../1-entities/tenant.entity";
import { BaseModel, ModelDependencies, ModelDependency } from "./base-model";
import { ModelHelper } from "./model-helper";
import { TenantContext } from "./tenant-context";

/**
 * Tenant 配下のデータを扱うことに特化した Model
 * TenantContext を保有
 */
export abstract class TenantScopedModel<
  D extends ModelDependencies
> extends BaseModel<D> {
  constructor(dependencies: D) {
    super({ ...dependencies, events: [] });

    if (TenantContext.hasInstance) {
      const errors = ModelHelper.toEntitiesArray(this).filter(
        (e) => "tenantId" in e && e["tenantId"] !== TenantContext.instance.id
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
  }

  get tenant() {
    return TenantContext.instance.tenant;
  }

  get tenantId() {
    return this.tenant.tenantId;
  }

  protected set<K extends keyof D>(key: K, data: NonArrayElement<D[K]>) {
    return super.set(key, this.assertTenantScoped(data));
  }

  protected add<K extends keyof D>(key: K, data: ArrayElement<D[K]>) {
    return super.add(key, this.assertTenantScoped(data));
  }

  /**
   * Tenant を update した場合、 context の内容も更新します
   */

  protected update(updated: ModelDependency): void {
    if (updated instanceof Tenant) {
      TenantContext.instance.tenant = updated;
    }
    return super.update(this.assertTenantScoped(updated));
  }

  /**
   * @param data が Tenant 配下であることを検証
   */
  private assertTenantScoped<T>(data: T): T {
    if (
      (data instanceof TenantScopedEntity ||
        data instanceof TenantScopedModel) &&
      data.tenantId !== this.tenantId
    ) {
      throw new HttpsError("internal", `updated.tenantId not matched`);
    }
    return data;
  }
}
