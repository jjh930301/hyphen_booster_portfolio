import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRes } from 'src/models';
import { DashboardService } from './dashboard.service';
import { DateRangeDto } from './dto/date.range.dto';
import { DayWeekMonthTypeDto } from './dto/day.week.month.type';
import { CountListResponse } from './response/count.list.response';
import { CountResponse } from './response/count.response';

@ApiTags('dashboard')
@ApiBearerAuth('Required admin accessToken')
@Controller()
export class DashboardController {

  constructor(
    private readonly dashboardSvc : DashboardService
  ) {}

  @ApiOperation({
    summary : '가입 / 사업자 등록 수'
  })
  @ApiResponse({
    type : CountResponse
  })
  @Get('count')
  async count(
    @Res() res,
    @Query() date : DateRangeDto,
  ) {
    try {
      const serviceData = await this.dashboardSvc.count(date);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '가업자 / 사업자 등록 / 연결기관 수 리스트'
  })
  @ApiResponse({
    type : CountListResponse
  })
  @Get('count/list')
  async countList(
    @Res() res,
    @Query() date : DateRangeDto,
    @Query() type : DayWeekMonthTypeDto
  ) {
    try {
      const serviceData = await this.dashboardSvc.countList(date , type.type)
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
