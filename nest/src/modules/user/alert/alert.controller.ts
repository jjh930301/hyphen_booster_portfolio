import { Body, Controller, Get, Param, Put, Query, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { User } from "src/entities/booster/user/user.entity";
import { ApiRes, ServiceData } from "src/models";
import { PaginationDto } from "src/modules/main/dto/pagination.dto";
import { UserService } from "../user.service";
import { AlertService } from "./alert.service";
import { AlertTypeDto } from "./dto/alert.type.dto";
import { ChangedAlertDto } from "./dto/changed.alert.dto";
import { ReadAllDto } from "./dto/real.all.dto";
import { AlertsResponse } from "./response/alerts.response";

@ApiTags('alert')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class AlertController {

  constructor(
    private readonly alertSvc : AlertService,
  ){}

  @ApiOperation({
    summary : '알림 목록',
    description : `
      5101 : server error
      4101 : business id not match
    `
  })
  @ApiResponse({
    type : AlertsResponse
  })
  @Get(':business_id/:device_id')
  async alerts(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Param('device_id') deviceId : string,
    @Query() page : PaginationDto,
    @Query() type : AlertTypeDto
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      const device : UserDevice = user.getDevice(deviceId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'user',
        ).apiResponse(res).send();
      }
      const serviceData = await this.alertSvc.alerts(business , page , type.type , device);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '알림 on/off',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    description : 'User model'
  })
  @Put()
  async changedAlert(
    @Res() res,
    @Req() req,
    @Body() body : ChangedAlertDto
  ) {
    try {
      const serviceData = await this.alertSvc.changedAlert(req.user, body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '읽음 처리',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    description : 'End response'
  })
  @Put('read')
  async readAll(
    @Res() res,
    @Body() ids : ReadAllDto
  ) {
    try {
      this.alertSvc.readAll(ids.ids);
      return ApiRes.end(res);
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}