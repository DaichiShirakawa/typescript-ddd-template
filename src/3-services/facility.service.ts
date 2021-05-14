import { TenantModel } from "../2-models/tenant.model";
import { HttpsError } from "../express/https-error";
import { BaseTenantService } from "./_base-tenant-model";
import { Facility } from "../1-entities/facility.entity";

export class FacilityService extends BaseTenantService {
  async list(): Promise<Facility[]> {
    return await this.findTransaction((tx) => tx.find(Facility));
  }

  async register(init: Pick<Facility, "name">): Promise<Facility> {
    return this.transaction(async (tx) => {
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
      const facilityModel = tenantModel.registerFacility(init);

      return {
        returns: () => facilityModel.facility,
        saveModels: [facilityModel],
      };
    });
  }
}
