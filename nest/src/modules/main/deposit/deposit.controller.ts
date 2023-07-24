import { Body, Controller, Get, Param, Put, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { CardListDto } from '../dto/card.list.dto';
import { DateRangeDto } from '../dto/date.range.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { DepositService } from './deposit.service';
import { DepositStatusDto } from './dto/deposit.status.dto';
import { DepositCardResponse } from './response/deposit.card.response';
import { DepositDateResponse } from './response/deposit.date.response';
import { DepositListResponse } from './response/deposit.list.response';
import { HoldDepositResponse } from './response/hold.deposit.response';

@ApiTags('deposit')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class DepositController {

  constructor(
    private readonly depositSvc : DepositService
  ){}

  @ApiOperation({
    summary : '기간별 입금 내역 일별 조회',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DepositDateResponse
  })
  @Get('date/:business_id')
  async depositDate(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() query : DateRangeDto,
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
      const serviceData = await this.depositSvc.depositDate(
        business,
        query,
        0
      )
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '카드별 입금 내역 조회',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DepositCardResponse
  })
  @Get('card/:business_id')
  async depositCard(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() query : DateRangeDto,
  ) {
    try{
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.depositSvc.depositDate(
        business,
        query,
        1
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '입금 내역 상세 리스트',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DepositListResponse
  })
  @Get('list/:business_id')
  async depositList(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() cards : CardListDto,
    @Query() page : PaginationDto
  ) {
    try{
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.depositSvc.depositList(
        business,
        date,
        cards,
        page
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '미입금 조회',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : HoldDepositResponse
  })
  @Get('hold/:business_id')
  async holdDeposit(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() cards : CardListDto,
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
      const serviceData = await this.depositSvc.holdDeposit(business , cards);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  // @ApiOperation({
  //   summary : '미입금 상태 변경',
  //   description : `
  //     5101 : server error
  //     4101 : businessId not match
  //   `
  // })
  // @ApiBody({
  //   type : DepositStatusDto
  // })
  // @Put('status/:business_id')
  // async changeStatus(
  //   @Res() res,
  //   @Req() req,
  //   @Param('business_id') businessId : string,
  //   @Body() body : DepositStatusDto
  // ) {
  //   try {

  //   } catch(e) {
  //     return ApiRes._500(res , e.toString());
  //   }
  // }
}
