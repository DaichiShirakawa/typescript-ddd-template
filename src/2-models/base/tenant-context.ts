import { Context } from "../../0-base/context";
import { ContextHolder } from "../../0-base/context-holder";
import { HttpsError } from "../../0-base/https-error";
import { Tenant } from "../../1-entities/tenant.entity";

/**
 * 特定テナントに関する操作のコンテキスト
 */
export class TenantContext extends Context {
  constructor(private _tenant: Tenant) {
    super();
  }

  static get instance() {
    return ContextHolder.get(TenantContext);
  }

  get tenant() {
    return this._tenant;
  }

  set tenant(tenant: Tenant) {
    if (this.tenant.id !== tenant.id) {
      throw new HttpsError("internal", `TenantContext.tenant.id not matched`);
    }
    this._tenant = tenant;
  }

  get id(): string {
    return this.tenant.tenantId;
  }
}
