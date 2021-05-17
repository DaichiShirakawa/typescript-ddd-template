import { Tenant } from "../../1-entities/tenant.entity";

export type RegisterTenantReq = Pick<Tenant, "name" | "code">;
