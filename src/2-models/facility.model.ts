import { TenantContextHolder } from "./base/tenant-context";
import { Facility } from "../1-entities/facility.entity";
import { TenantScopedModel } from "./base/tenant-scoped-model";

type D = { facility: Facility };

/**
 * for Facility layer
 */
export class FacilityModel extends TenantScopedModel<D> {
  static FACILITY_NAME = /^[A-z]{1}[A-z0-9\-_]{0,31}[A-z0-9]{1}$/;

  constructor(ch: TenantContextHolder, dependencies: D) {
    super(ch, { ...dependencies });
  }

  get id() {
    return this.facility.id;
  }

  get facility() {
    return this.dependencies.facility;
  }

  static register(ch: TenantContextHolder, init: Partial<Facility>) {
    const facility = new Facility(ch.context.tenantId, init);
    return new FacilityModel(ch, { facility });
  }

  updateFacilityName(name: string) {
    const { facility } = this.dependencies;
    this.update(facility.set({ name }));
    return this;
  }
}
