import { Controller, Get, Param, Put, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { DateRangeDto } from 'src/modules/main/dto/date.range.dto';
import { DeliveryStatisticsResponse } from 'src/modules/statistics/response/delivery.statistics.response';
import { TimeStatisticsResponse } from 'src/modules/statistics/response/time.statistics.response';
import { StatisticsService } from 'src/modules/statistics/statistics.service';
import { Report2Service } from './report.service';
import { ReportDepositResponse } from './response/report.deposit.response';
import { ReportMonthlyStackResponse } from './response/report.monthly.stack.response';
import { ReportSalesResponse } from './response/report.sales.response';

@ApiTags('v2/report')
@ApiBearerAuth('Required user accessToken')
@Controller()
export class Report2Controller {
  constructor(
    private readonly reportSvc : Report2Service,
    private readonly statisticsSvc : StatisticsService
  ){}

  @ApiOperation({
    summary : '리포트 업데이트'
  })
  @Put(':report_id')
  async updateReport(
    @Res() res,
    @Req() req,
    @Param('report_id') report_id : string,
  ) {
    try {
      const serviceData = await this.reportSvc.updateReport(report_id);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '입금 예정'
  })
  @ApiResponse({
    type : ReportDepositResponse
  })
  @Get('purchase/:business_id')
  async purchase(
    @Res() res,
    @Req() req,
    @Query() date : DateRangeDto,
    @Param('business_id') businessId : string,
  ) {
    try {
      if(!date.start_date || !date.end_date) {
        return ServiceData.invalidRequest(
          'Required date range',
          4104
        ).apiResponse(res).send();
      }
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.reportSvc.purchase(business , date)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '입금'
  })
  @ApiResponse({
    type : ReportDepositResponse
  })
  @Get('deposit/:business_id')
  async deposit(
    @Res() res,
    @Req() req,
    @Query() date : DateRangeDto,
    @Param('business_id') businessId : string,
  ) {
    try {
      if(!date.start_date || !date.end_date) {
        return ServiceData.invalidRequest(
          'Required date range',
          4104
        ).apiResponse(res).send();
      }
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.reportSvc.deposit(business , date);
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e)
    }
  }

  @ApiOperation({
    summary : '매출'
  })
  @ApiResponse({
    type : ReportSalesResponse
  })
  @Get('sales/:business_id')
  async sales(

    @Res() res,
    @Req() req,
    @Query() date : DateRangeDto,
    @Param('business_id') businessId : string,
  ) {
    try {
      if(!date.start_date || !date.end_date) {
        return ServiceData.invalidRequest(
          'Required date range',
          4104
        ).apiResponse(res).send();
      }
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.reportSvc.sales(business , date);
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e)
    }
  }

  @ApiOperation({
    summary : '배달분석'
  })
  @ApiResponse({
    type : DeliveryStatisticsResponse
  })
  @Get('delivery/:business_id')
  async deliveryStatistics(
    @Res() res,
    @Req() req,
    @Query() date : DateRangeDto,
    @Param('business_id') businessId : string,
  ) {
    try {
      if(!date.start_date || !date.end_date) {
        return ServiceData.invalidRequest(
          'Required date range',
          4104
        ).apiResponse(res).send();
      }
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.statisticsSvc.deliveryStatistics(
        business,
        date
      );
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e)
    }
  }

  @ApiOperation({
    summary : '요일 분석',
  })
  @ApiResponse({
    description : `
      "before": 786000,
      "this": 688950
    `
  })
  @Get('day/:business_id')
  async day(
    @Res() res,
    @Req() req,
    @Query() date : DateRangeDto,
    @Param('business_id') businessId : string,
  ) {
    try {
      if(!date.start_date || !date.end_date) {
        return ServiceData.invalidRequest(
          'Required date range',
          4104
        ).apiResponse(res).send();
      }
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.reportSvc.day(business ,date);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e)
    }
  }

  @ApiOperation({
    summary : '시간대 분석'
  })
  @ApiResponse({
    type : TimeStatisticsResponse
  })
  @Get('time/:business_id')
  async time(
    @Res() res,
    @Req() req,
    @Query() date : DateRangeDto,
    @Param('business_id') businessId : string,
  ) {
    try {
      if(!date.start_date || !date.end_date) {
        return ServiceData.invalidRequest(
          'Required date range',
          4104
        ).apiResponse(res).send();
      }
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.statisticsSvc.timeStatistics(business , date);
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e)
    }
  }

  @ApiOperation({
    summary : '월 누적'
  })
  @ApiResponse({
    type : ReportMonthlyStackResponse
  })
  @Get('monthly/:business_id')
  async monthlyStack(
    @Res() res,
    @Req() req,
    @Query() date : DateRangeDto,
    @Param('business_id') businessId : string,
  ) {
    try {
      if(!date.start_date || !date.end_date) {
        return ServiceData.invalidRequest(
          'Required date range',
          4104
        ).apiResponse(res).send();
      }
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.reportSvc.monthlyStack(business ,date);
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e)
    }
  }
}
