import { Tenant } from "../../1-entities/tenant.entity";
import { HttpsError } from "../https-error";
import { BaseContext } from "./base-context";

/**
 * 特定テナントに関する操作のコンテキスト
 */
export class TenantContext extends BaseContext<TenantContext> {
  constructor(init: { source?: BaseContext; tenant?: Tenant }) {
    super(init);
  }

  public get hasTenant() {
    return this.context.tenant != null;
  }

  public get tenant(): Tenant {
    if (!this.hasTenant) {
      throw new HttpsError("internal", `TenantContext.tenant not set`);
    }
    return this.context.tenant!;
  }

  public get tenantId(): string {
    return this.tenant.tenantId;
  }
}
