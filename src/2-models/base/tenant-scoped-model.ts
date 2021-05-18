import { HttpsError } from "../../0-base/https-error";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { TenantScopedEntity } from "../../1-entities/base/tenant-scoped-entity";
import { Tenant } from "../../1-entities/tenant.entity";
import { BaseModel, ModelDependencies, ModelDependency } from "./base-model";
import { ModelHelper } from "./model-helper";
import { TenantContext, TenantContextHolder } from "./tenant-context";
import { NonArrayElement, ArrayElement } from "../../0-base/type-helper";

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

  protected set<K extends keyof D>(key: K, data: NonArrayElement<D[K]>) {
    super.set(key, this.assertTenantScoped(data));
  }

  protected add<K extends keyof D>(key: K, data: ArrayElement<D[K]>) {
    super.add(key, this.assertTenantScoped(data));
  }

  /**
   * Tenant を update した場合、 context の内容も更新します
   */

  protected update(updated: ModelDependency): void {
    if (updated instanceof Tenant) {
      this.context.tenant = updated as any;
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
