import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { PaginationDto } from 'src/modules/main/dto/pagination.dto';
import { ReportTypeDto } from './dto/report.type.dto';
import { ReportService } from './report.service';

@ApiTags('report')
@ApiBearerAuth('Required user accessToken')
@Controller()
export class ReportController {
  constructor(
    private readonly reportSvc : ReportService
  ){}

  @ApiOperation({
    summary : '리포트 목록',
    description : `
      5101 : server error
    `
  })
  @Get(':business_id')
  async reports(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() page : PaginationDto,
    @Query() type : ReportTypeDto
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.reportSvc.reports(business , page , type.type);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '월간 리포트 생성 테스트',
    deprecated : true
  })
  @Get('month/test/:business_id')
  async monthTest(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
  ) {
    return ServiceData.cannotAccess().apiResponse(res).send();
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.reportSvc.monthTest(business , user.devices);
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '리포트 생성 테스트',
    // deprecated : true
  })
  @Get('test/:business_id')
  async test(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
  ) {
    // return ServiceData.cannotAccess().apiResponse(res).send();
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.reportSvc.test(business , user.devices);
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
