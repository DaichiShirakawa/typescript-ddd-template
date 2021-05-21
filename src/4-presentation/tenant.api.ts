import {
  Body,
  Controller,
  Get,
  Patch,
  Path,
  Post,
  Route,
  Security,
  Tags,
} from "tsoa";
import { Tenant } from "../1-entities/tenant.entity";
import { TenantService } from "../3-services/tenant.service";
import { Scopes, Securities } from "./base/securities";
import { RegisterTenantReq } from "./interfaces/tenant.if";
import { SuperTenantService } from "../3-services/super-tenant.service";

@Route("/tenants")
@Tags("01: Tenant")
export class TenantAPI extends Controller {
  /**
   * 新たな Tenant を登録します
   *
   * @param data 名前、コード
   * @returns 登録した Tenant
   */
  @Post("/")
  @Security(Securities.API, [Scopes.SUPER])
  async register(@Body() data: RegisterTenantReq): Promise<Tenant> {
    return new SuperTenantService().register(data);
  }

  @Get("/")
  @Security(Securities.API, [Scopes.SUPER])
  async list(): Promise<Tenant[]> {
    return new SuperTenantService().list();
  }

  @Get("/:tenantId")
  @Security(Securities.API, [Scopes.SUPER])
  async find(@Path() tenantId: string): Promise<Tenant> {
    return new SuperTenantService().find(tenantId);
  }

  @Patch("/:tenantId/name")
  @Security(Securities.API, [Scopes.TENANT])
  async updateName(@Body() data: { name: string }, @Path() tenantId: string) {
    return new TenantService().updateName(data.name);
  }

  @Patch("/:tenantId/code")
  @Security(Securities.API, [Scopes.TENANT])
  async updateCode(@Body() data: { code: string }, @Path() tenantId: string) {
    return new TenantService().updateCode(data.code);
  }
}
