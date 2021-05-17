import { TenantModel } from "../2-models/tenant.model";
import { HttpsError } from "../0-base/https-error";
import { TenantScopedService } from "./base/tenant-scoped-service";
import { Facility } from "../1-entities/facility.entity";

export class FacilityService extends TenantScopedService {
  async list(): Promise<Facility[]> {
    return await this.startReadonlyTx((tx) => tx.find(Facility));
  }

  async register(init: Pick<Facility, "name">): Promise<Facility> {
    return this.startTx(async (tx) => {
      const existing = await tx.findOne(Facility, {
        where: { name: init.name },
      });
      if (existing) {
        throw new HttpsError(
          "already-exists",
          `Facility.name already exists: "${init.name}"`
        );
      }

      const tenantModel = new TenantModel(this);
      const facilityModel = tenantModel.addFacility(init);

      return {
        returns: () => facilityModel.dependencies.facility,
        saveModels: [facilityModel],
      };
    });
  }
}
