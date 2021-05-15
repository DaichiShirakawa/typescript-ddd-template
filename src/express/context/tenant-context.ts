import { Tenant } from "../../1-entities/tenant.entity";
import { HttpsError } from "../https-error";
import { Context } from "./base-context";

/**
 * 特定テナントに関する操作のコンテキスト
 */
export class TenantContext extends Context<TenantContext> {
  constructor(init: { source?: Context; tenant?: Tenant }) {
    super(init);
  }

  public get hasTenant() {
    return this.context.tenant != null;
  }

  public get tenant(): Tenant {
    if (this.context.tenant == null) {
      throw new HttpsError("internal", `TenantContext.tenant not set`);
    }
    return this.context.tenant;
  }

  public set tenant(tenant: Tenant) {
    if (this.context.tenant != null && this.context.tenant.id !== tenant.id) {
      throw new HttpsError("internal", `TenantContext.tenant.id not matched`);
    }
    this.context.tenant = tenant;
  }

  public get tenantId(): string {
    return this.tenant.tenantId;
  }
}
