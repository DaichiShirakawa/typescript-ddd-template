import { Facility } from "../1-entities/facility.entity";
import { TenantScopedModel } from "./base/tenant-scoped-model";
import { TenantContext } from "./base/tenant-context";

type D = { facility: Facility };

/**
 * for Facility layer
 */
export class FacilityModel extends TenantScopedModel<D> {
  static FACILITY_NAME = /^[A-z]{1}[A-z0-9\-_]{0,31}[A-z0-9]{1}$/;

  constructor(dependencies: D) {
    super({ ...dependencies });
  }

  get id() {
    return this.facility.id;
  }

  get facility() {
    return this.dependencies.facility;
  }

  static register(init: Partial<Facility>) {
    const facility = new Facility(TenantContext.instance.id, init);
    return new FacilityModel({ facility });
  }

  updateFacilityName(name: string) {
    const { facility } = this.dependencies;
    this.update(facility.set({ name }));
    return this;
  }
}
