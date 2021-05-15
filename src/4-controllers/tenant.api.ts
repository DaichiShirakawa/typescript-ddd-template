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
import { Securities } from "../express/security/securities";
import {
  ConsoleReq,
  ConsoleTenantReq,
} from "../express/security/console-security";
import { RegisterTenantReq } from "./interfaces/tenant.if";

@Route("/tenants")
@Tags("01: Tenant")
export class TenantAPI extends Controller {
  @Post("/")
  @Security(Securities.CONSOLE)
  async register(
    @Request() req: ConsoleReq,
    @Body() data: RegisterTenantReq
  ): Promise<Tenant> {
    return TenantService.register(req, data);
  }

  @Get("/")
  @Security(Securities.CONSOLE)
  async list(@Request() req: ConsoleTenantReq): Promise<Tenant[]> {
    return new TenantService(req).list();
  }

  @Get("/:tenantId")
  @Security(Securities.CONSOLE_TENANT)
  async find(
    @Request() req: ConsoleTenantReq,
    @Path() tenantId: string
  ): Promise<Tenant> {
    return new TenantService(req).find(tenantId);
  }

  @Patch("/:tenantId/name")
  @Security(Securities.CONSOLE_TENANT)
  async updateName(
    @Request() req: ConsoleTenantReq,
    @Body() data: { name: string },
    @Path() tenantId: string
  ) {
    return new TenantService(req).updateName(data.name);
  }

  @Patch("/:tenantId/code")
  @Security(Securities.CONSOLE_TENANT)
  async updateCode(
    @Request() req: ConsoleTenantReq,
    @Body() data: { code: string },
    @Path() tenantId: string
  ) {
    return new TenantService(req).updateCode(data.code);
  }
}
