import { Request } from "express";
import { getRepository } from "typeorm";
import { ContextHolder } from "../../0-definitions/context";
import { Tenant } from "../../1-entities/tenant.entity";
import {
  TenantContext,
  TenantContextHolder,
} from "../../2-models/base/tenant-context";
import { APIContext } from "./api-context";
import { Scopes, Securities } from "./securities";

export type APIReq = Request & ContextHolder<APIContext>;
export type TenantScopedReq = Request & TenantContextHolder;

export class ConsoleSecurity {
  static async verify(req: Request, security: Securities, scopes: Scopes[]) {
    const apiReq: APIReq = ConsoleSecurity.all(req, security, scopes);

    if (scopes.includes(Scopes.TENANT)) {
      return await ConsoleSecurity.tenantScoped(apiReq, security, scopes);
    }

    return apiReq;
  }

  static all(req: Request, security: Securities, scopes: string[]): APIReq {
    const context = new APIContext(req, security, scopes);
    const result: APIReq = Object.assign(req, { context }) as any;
    return result;
  }

  static async tenantScoped(
    req: APIReq,
    security: Securities,
    scopes: string[]
  ): Promise<TenantScopedReq> {
    // TODO: トークン化・verify
    const tenantId = req.header("x-tenant-id");
    const tenant = await getRepository(Tenant).findOneOrFail(tenantId);

    const context = new TenantContext({
      source: ConsoleSecurity.all(req, security, scopes),
      tenant,
    });

    const result: TenantScopedReq = Object.assign(req, { context }) as any;
    return result;
  }
}
