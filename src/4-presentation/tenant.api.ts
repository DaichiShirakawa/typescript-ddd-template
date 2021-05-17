import {
  Body,
  Controller,
  Get,
  Patch,
  Path,
  Post,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { Tenant } from "../1-entities/tenant.entity";
import { TenantService } from "../3-services/tenant.service";
import { APIReq, TenantScopedReq } from "./base/console-security";
import { Scopes, Securities } from "./base/securities";
import { RegisterTenantReq } from "./interfaces/tenant.if";

@Route("/tenants")
@Tags("01: Tenant")
export class TenantAPI extends Controller {
  @Post("/")
  @Security(Securities.CONSOLE)
  async register(
    @Request() req: APIReq,
    @Body() data: RegisterTenantReq
  ): Promise<Tenant> {
    return TenantService.register(req, data);
  }

  @Get("/")
  @Security(Securities.CONSOLE)
  async list(@Request() req: TenantScopedReq): Promise<Tenant[]> {
    return new TenantService(req).list();
  }

  @Get("/:tenantId")
  @Security(Securities.CONSOLE, [Scopes.TENANT])
  async find(
    @Request() req: TenantScopedReq,
    @Path() tenantId: string
  ): Promise<Tenant> {
    return new TenantService(req).find(tenantId);
  }

  @Patch("/:tenantId/name")
  @Security(Securities.CONSOLE, [Scopes.TENANT])
  async updateName(
    @Request() req: TenantScopedReq,
    @Body() data: { name: string },
    @Path() tenantId: string
  ) {
    return new TenantService(req).updateName(data.name);
  }

  @Patch("/:tenantId/code")
  @Security(Securities.CONSOLE, [Scopes.TENANT])
  async updateCode(
    @Request() req: TenantScopedReq,
    @Body() data: { code: string },
    @Path() tenantId: string
  ) {
    return new TenantService(req).updateCode(data.code);
  }
}
