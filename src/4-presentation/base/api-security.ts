import { Request } from "express";
import { getRepository } from "typeorm";
import { ContextHolder } from "../../0-base/context-holder";
import { Tenant } from "../../1-entities/tenant.entity";
import { TenantContext } from "../../2-models/base/tenant-context";
import { SuperContext } from "../../3-services/base/super-context";
import { Scopes } from "./securities";

export class APISecurity {
  static async verify(req: Request, scopes: Scopes[]) {
    if (scopes.includes(Scopes.SUPER)) {
      await APISecurity.super(req);
    }

    if (scopes.includes(Scopes.TENANT)) {
      await APISecurity.tenant(req);
    }
  }

  static async super(req: Request) {
    // TODO: Verify Super User
    ContextHolder.set(new SuperContext("Dummy Super User"));
  }

  static async tenant(req: Request) {
    // TODO: トークン化・verify
    const tenantId = req.header("x-tenant-id");
    const tenant = await getRepository(Tenant).findOneOrFail(tenantId);

    ContextHolder.set(new TenantContext(tenant));
  }
}
