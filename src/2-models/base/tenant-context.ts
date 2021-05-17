import { Tenant } from "../../1-entities/tenant.entity";
import { HttpsError } from "../../0-base/https-error";
import { Context, ContextHolder } from "../../0-base/context";

/**
 * 特定テナントに関する操作のコンテキスト
 */
export class TenantContext extends Context<{ tenant?: Tenant }> {
  public get hasTenant() {
    return this.dataset.tenant != null;
  }

  public get tenant(): Tenant {
    if (this.dataset.tenant == null) {
      throw new HttpsError("internal", `TenantContext.tenant not set`);
    }
    return this.dataset.tenant;
  }

  public set tenant(tenant: Tenant) {
    if (this.dataset.tenant != null && this.dataset.tenant.id !== tenant.id) {
      throw new HttpsError("internal", `TenantContext.tenant.id not matched`);
    }
    this.dataset.tenant = tenant;
  }

  public get tenantId(): string {
    return this.tenant.tenantId;
  }
}

export type TenantContextHolder = ContextHolder<TenantContext>;
