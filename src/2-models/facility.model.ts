import { Facility } from "../1-entities/facility.entity";
import { ContextHolder } from "../express/security/base-context";
import { BaseTenantModel } from "./_base-tenant-model";
import { TenantContext } from "../express/security/tenant-context";

type E = { facility: Facility };

/**
 * for Facility layer
 */
export class FacilityModel extends BaseTenantModel<E> implements E {
  static PROVIDER_NAME_REGEX = /^[A-z]{1}[A-z0-9\-_]{0,31}[A-z0-9]{1}$/;

  constructor(ch: ContextHolder<TenantContext>, init: E) {
    super(ch, { ...init });
  }

  get facility() {
    return this.entities.facility;
  }

  static register(ch: ContextHolder<TenantContext>, init: Partial<Facility>) {
    const facility = new Facility(ch, init);
    return new FacilityModel(ch, { facility });
  }

  updateFacilityName(name: string) {
    this.entities.facility = this.facility.clone({ name });
    return this;
  }
}
