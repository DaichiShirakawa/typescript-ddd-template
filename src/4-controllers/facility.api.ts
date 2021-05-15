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
import { Securities } from "../express/security/securities";
import { ConsoleTenantReq } from "../express/security/console-security";
import { RegisterFacilityReq } from "./interfaces/facility.if";
import { Facility } from "../1-entities/facility.entity";
import { FacilityService } from "../3-services/facility.service";

@Route("/tenants/:tenantId/facilities")
@Tags("02: Facility")
export class FacilityAPI extends Controller {
  @Post("/")
  @Security(Securities.CONSOLE_TENANT)
  async registerFacilityGMO(
    @Request() req: ConsoleTenantReq,
    @Path() tenantId: string,
    @Body() data: RegisterFacilityReq
  ): Promise<Facility> {
    return await new FacilityService(req).register(data);
  }

  @Get("/:tenantId/facilities")
  @Security(Securities.CONSOLE_TENANT)
  async listFacilities(
    @Request() req: ConsoleTenantReq,
    @Path() tenantId: string
  ): Promise<Facility[]> {
    return await new FacilityService(req).list();
  }
}
