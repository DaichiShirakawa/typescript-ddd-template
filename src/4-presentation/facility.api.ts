import { Body, Controller, Get, Post, Route, Security, Tags } from "tsoa";
import { Facility } from "../1-entities/facility.entity";
import { Scopes, Securities } from "./base/securities";
import { RegisterFacilityReq } from "./interfaces/facility.if";
import { FacilityService } from "../3-services/facility.service";

@Route("/facilities")
@Tags("02: Facility")
export class FacilityAPI extends Controller {
  @Post("/")
  @Security(Securities.API, [Scopes.TENANT])
  async registerFacilityGMO(
    @Body() data: RegisterFacilityReq
  ): Promise<Facility> {
    return await new FacilityService().register(data);
  }

  @Get("/")
  @Security(Securities.API, [Scopes.TENANT])
  async listFacilities(): Promise<Facility[]> {
    return await new FacilityService().list();
  }
}
