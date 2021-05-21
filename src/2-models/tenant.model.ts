import { HttpsError } from "../0-base/https-error";
import { Facility } from "../1-entities/facility.entity";
import { Tenant } from "../1-entities/tenant.entity";
import { TenantContext } from "./base/tenant-context";
import { TenantScopedModel } from "./base/tenant-scoped-model";
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

  constructor(context = TenantContext.instance) {
    super({ tenant: context.tenant, facilityModels: [] });
  }

  get id() {
    return this.tenantId;
  }

  static register(init: Pick<Tenant, "name" | "code">) {
    const tenant = new Tenant(init);
    const context = new TenantContext(tenant);
    const model = new TenantModel(context);

    model.validateCode(init.code);
    return { model, context };
  }

  updateName(name: string) {
    const { tenant } = this.dependencies;
    this.update(tenant.set({ name }));
    return this;
  }

  updateCode(code: string) {
    const { tenant } = this.dependencies;
    this.update(tenant.set({ code }));
    this.validateCode(code);
    return this;
  }

  private validateCode(code: string) {
    if (!code.match(TenantModel.TENANT_CODE_REGEX)) {
      throw new HttpsError(
        "out-of-range",
        `code should match to ${TenantModel.TENANT_CODE_REGEX}: "${this.tenant.code}"`
      );
    }
    return this;
  }

  addFacility(init: Pick<Facility, "name">) {
    const added = FacilityModel.register(init);
    this.add("facilityModels", added);
    return added;
  }
}
