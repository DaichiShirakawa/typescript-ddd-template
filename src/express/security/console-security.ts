import { Request } from "express";
import { ContextHolder } from "../context/base-context";
import { Securities } from "./securities";
import { getRepository } from "typeorm";
import { Tenant } from "../../1-entities/tenant.entity";
import { TenantContext } from "../context/tenant-context";
import { APIContext } from "../context/api-context";

export interface ConsoleReq extends ContextHolder<APIContext> {}
export interface ConsoleTenantReq extends ContextHolder<TenantContext> {}

export async function consoleSecurity(
  req: Request,
  security: Securities,
  scopes: string[]
): Promise<ConsoleReq> {
  const context = new APIContext(req, security, scopes);
  const result: ConsoleReq = Object.assign(req, { context }) as any;
  return result;
}

export async function consoleTenantSecurity(
  req: Request,
  security: Securities,
  scopes: string[]
): Promise<ConsoleTenantReq> {
  // TODO: トークン化・verify
  const tenantId = req.header("x-tenant-id");
  const tenant = await getRepository(Tenant).findOneOrFail(tenantId);

  const context = new TenantContext({
    source: new APIContext(req, security, scopes),
    tenant,
  });

  const result: ConsoleTenantReq = Object.assign(req, { context }) as any;
  return result;
}
