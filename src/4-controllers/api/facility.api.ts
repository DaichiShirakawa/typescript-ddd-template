import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { Facility } from "../../1-entities/facility.entity";
import { FacilityService } from "../../3-services/facility.service";
import { TenantScopedReq } from "../security/console-security";
import { Scopes, Securities } from "../security/securities";
import { RegisterFacilityReq } from "../interfaces/facility.if";

@Route("/tenants/:tenantId/facilities")
@Tags("02: Facility")
export class FacilityAPI extends Controller {
  @Post("/")
  @Security(Securities.CONSOLE, [Scopes.TENANT])
  async registerFacilityGMO(
    @Request() req: TenantScopedReq,
    @Path() tenantId: string,
    @Body() data: RegisterFacilityReq
  ): Promise<Facility> {
    return await new FacilityService(req).register(data);
  }

  @Get("/:tenantId/facilities")
  @Security(Securities.CONSOLE, [Scopes.TENANT])
  async listFacilities(
    @Request() req: TenantScopedReq,
    @Path() tenantId: string
  ): Promise<Facility[]> {
    return await new FacilityService(req).list();
  }
}
