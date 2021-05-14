import { Facility } from "../1-entities/facility.entity";

export type RegisterFacilityReq = Pick<Facility, "name">;
