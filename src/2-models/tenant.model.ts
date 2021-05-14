import { Tenant } from "../1-entities/tenant.entity";
import { HttpsError } from "../express/https-error";
import { ContextHolder, BaseContext } from "../express/security/base-context";
import { FacilityModel } from "./facility.model";
import { BaseTenantModel } from "./_base-tenant-model";
import { TenantContext } from "../express/security/tenant-context";
import { Facility } from "../1-entities/facility.entity";

type E = {
  tenant: Tenant;
  facilities: FacilityModel[];
};

/**
 * テナントおよびテナント直下設定を担うモデル
 */
export class TenantModel extends BaseTenantModel<E> implements E {
  static TENANT_CODE_REGEX = /^[a-z0-9\-_]{3,32}$/;

  constructor(ch: ContextHolder<TenantContext>) {
    if (!ch.context.hasTenant) {
      throw new HttpsError(
        "internal",
        `No tenant in context, use register() first`
      );
    }
    super(ch, { tenant: ch.context.tenant, facilities: [] });
  }

  get facilities() {
    return this.entities.facilities;
  }

  static register(ch: ContextHolder, init: Pick<Tenant, "name" | "code">) {
    const tenant = new Tenant(init);
    const context = new TenantContext({ source: ch.context, tenant });
    const model = new TenantModel({ context });
    model.validateCode();
    return model;
  }

  updateName(name: string) {
    this.entities.tenant = this.tenant.clone({ name });
    return this;
  }

  updateCode(code: string) {
    this.entities.tenant = this.tenant.clone({ code });
    this.validateCode();
    return this;
  }

  validateCode() {
    if (!this.tenant.code.match(TenantModel.TENANT_CODE_REGEX)) {
      throw new HttpsError(
        "out-of-range",
        `code should match to ${TenantModel.TENANT_CODE_REGEX}: "${this.tenant.code}"`
      );
    }
    return this;
  }

  registerFacility(init: Pick<Facility, "name">) {
    const facilityModel = FacilityModel.register(this, init);
    this.entities.facilities.push(facilityModel);
    return facilityModel;
  }
}
