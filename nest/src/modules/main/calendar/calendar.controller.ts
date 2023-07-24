import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { DateRangeDto } from '../dto/date.range.dto';
import { CalendarService } from './calendar.service';

@ApiTags('calendar')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class CalendarController {
  constructor(
    private readonly calendarSvc : CalendarService
  ) {}

  @ApiOperation({
    summary : '전체매출 캘린더',
    description : `
      5101 : server error
      4101 : businessId not match
      4104 : required date
    `
  })
  @Get('sales/:business_id')
  async salesCalendar(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
  ) {
    try {
      if(!date.start_date || !date.end_date) {
        return ServiceData.invalidRequest(
          'Required date range',
          4104,
          'calendar',
        ).apiResponse(res).send();
      }
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'calendar',
        ).apiResponse(res).send();
      }
      const serviceData = await this.calendarSvc.salesCalendar(
        business,
        date
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '입금예정 캘린더',
    description : `
      5101 : server error
      4101 : businessId not match
      4104 : required date
    `,
  })
  @Get('purchase/:business_id')
  async purchaseCalendar(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
  ) {
    try {
      if(!date.start_date || !date.end_date) {
        return ServiceData.invalidRequest(
          'Required date range',
          4104,
          'calendar',
        ).apiResponse(res).send();
      }
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'calendar',
        ).apiResponse(res).send();
      }
      const serviceData = await this.calendarSvc.purchaseCalendar(
        business,
        date
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '입금완료 캘린더',
    description : `
      5101 : server error
      4101 : businessId not match
      4104 : required date
    `
  })
  @Get('deposit/:business_id')
  async depositCalendar(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
  ) {
    try {
      if(!date.start_date || !date.end_date) {
        return ServiceData.invalidRequest(
          'Required date range',
          4104,
          'calendar',
        ).apiResponse(res).send();
      }
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'calendar',
        ).apiResponse(res).send();
      }
      const serviceData = await this.calendarSvc.depositCalendar(business , date);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res, e.toString());
    }
  }
}