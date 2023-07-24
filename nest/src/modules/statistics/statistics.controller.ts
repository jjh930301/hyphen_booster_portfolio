import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { DateRangeDto } from '../main/dto/date.range.dto';
import { StatisticsTypeDto } from './dto/date.type.dto';
import { DayStatisticsResponse } from './response/day.statistics.response';
import { DeliveryStatisticsResponse } from './response/delivery.statistics.response';
import { TimeStatisticsResponse } from './response/time.statistics.response';
import { TypeStatisticsResponse } from './response/type.statistics.response';
import { StatisticsService } from './statistics.service';

@ApiTags('statistics')
@ApiBearerAuth('Required user accessToken')
@Controller()
export class StatisticsController {
  constructor(
    private readonly statSvc : StatisticsService
  ){}

  @ApiOperation({
    summary : '기간별통계',
    description : `
    5101 : server error
    4101 : businessId not match
    4104 : required date
    `
  })
  @Get('date/:business_id')
  async dateStatistics(
    @Req() req,
    @Res() res,
    @Param('business_id') businessId : string,
    @Query() type : StatisticsTypeDto,
    @Query() date : DateRangeDto
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
      const serviceData = await this.statSvc.dateStatistics(
        business,
        type.type,
        date
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '시간대별 통계',
    description : `
      5101 : server error
      4101 : businessId not match
      4104 : required date
    `
  })
  @ApiResponse({
    type : TimeStatisticsResponse
  })
  @Get('time/:business_id')
  async timeStatistics(
    @Req() req,
    @Res() res,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto
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
      const serviceData = await this.statSvc.timeStatistics(
        business,
        date
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '요일별 통계',
    description : `
      5101 : server error
      4101 : businessId not match
      4104 : required date
    `
  })
  @ApiResponse({
    type : DayStatisticsResponse
  })
  @Get('day/:business_id')
  async dayStatistics(
    @Req() req,
    @Res() res,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto
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
      const serviceData = await this.statSvc.dayStatistics(
        business,
        date
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '수단별 통계 / 사업자별도 동일',
    description : `
      5101 : server error
      4101 : businessId not match
      4104 : required date
    `
  })
  @ApiResponse({
    type : TypeStatisticsResponse
  })
  @Get('type/:business_id')
  async typeStatistics(
    @Req() req,
    @Res() res,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto
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
      const serviceData = await this.statSvc.typeStatistics(
        business,
        date
      )
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '배달분석',
    description : `
      5101 : server error
      4101 : businessId not match
      4104 : required date
    `
  })
  @ApiResponse({
    type : DeliveryStatisticsResponse
  })
  @Get('delivery/:business_id')
  async deliveryStatistics(
    @Req() req,
    @Res() res,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto
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
      const serviceData = await this.statSvc.deliveryStatistics(
        business,
        date
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
