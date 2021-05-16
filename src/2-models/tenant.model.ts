import { ContextHolder } from "../0-definitions/context";
import { Facility } from "../1-entities/facility.entity";
import { Tenant } from "../1-entities/tenant.entity";
import { HttpsError } from "../0-definitions/https-error";
import { TenantScopedModel } from "./base/tenant-scoped-model";
import { TenantContext, TenantContextHolder } from "./base/tenant-context";
import { FacilityModel } from "./facility.model";

type D = {
  tenant: Tenant;
  facilityModels: FacilityModel[];
};

/**
 * テナントおよびテナント直下設定を担うモデル
 */
export class TenantModel extends TenantScopedModel<D> {
  static TENANT_CODE_REGEX = /^[a-z0-9\-_]{3,32}$/;

  constructor(ch: TenantContextHolder) {
    if (!ch.context.hasTenant) {
      throw new HttpsError(
        "internal",
        `No tenant in context, use register() first`
      );
    }
    super(ch, {
      tenant: ch.context.tenant,
      facilityModels: [],
    });
  }

  static register(ch: ContextHolder, init: Pick<Tenant, "name" | "code">) {
    const tenant = new Tenant(init);
    const context = new TenantContext({ source: ch, tenant });
    const model = new TenantModel({ context });
    model.validateCode();
    return model;
  }

  updateName(name: string) {
    const { tenant } = this.dependencies;
    this.update("tenant", tenant.set({ name }));
    return this;
  }

  updateCode(code: string) {
    const { tenant } = this.dependencies;
    this.update("tenant", tenant.set({ code }));
    this.validateCode();
    return this;
  }

  private validateCode() {
    if (!this.tenant.code.match(TenantModel.TENANT_CODE_REGEX)) {
      throw new HttpsError(
        "out-of-range",
        `code should match to ${TenantModel.TENANT_CODE_REGEX}: "${this.tenant.code}"`
      );
    }
    return this;
  }

  addFacility(init: Pick<Facility, "name">) {
    const { facilityModels } = this.dependencies;
    const added = FacilityModel.register(this, init);
    this.update("facilityModels", [...facilityModels, added]);
    return added;
  }
}
