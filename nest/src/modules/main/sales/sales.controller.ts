import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { DateRangeDto } from '../dto/date.range.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { SalesService } from './sales.service';
import { CardListDto } from '../dto/card.list.dto';
import { CardDateResponse } from './response/card.date.response';
import { CardListResponse } from './response/card.list.response';
import { CardsResponse } from './response/cards.response';
import { CardApprDivDto } from './dto/card.appr.div.dto';
import { CancelCardDto } from './dto/cancel.card.dto';

@ApiTags('sales')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class SalesController {

  constructor(
    private readonly salesSvc : SalesService
  ){}

  @ApiOperation({
    summary : "취소건 조회",
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    description : `"date" : "2022-12-29T15:55:08.000Z"`
  })
  @Get('cancel/:business_id')
  async cancelCard(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() query : CancelCardDto,
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
      const serviceData = await this.salesSvc.cancelCard(business , query);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '기간별 승인 내역 카드 결제 조회',
    description : `
      5101 : server error,
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : CardDateResponse
  })
  @Get('date/:business_id')
  async dayCard(
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
      const serviceData = await this.salesSvc.dayCard(
        business,
        query,
        0
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '카드별 승인 내역 카드 결제 조회',
    description : `
      5101 : server error,
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : CardsResponse
  })
  @Get('card/:business_id')
  async cards(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() query : DateRangeDto,
    @Query() list : CardListDto,
    @Query() div : CardApprDivDto
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
      const serviceData = await this.salesSvc.dayCard(
        business,
        query,
        1,
        list,
        div
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '카드 승인 내역 리스트',
    description : `
      5101 : server error
      4101 : businessId not match
      5000 : required query string[page , count]
    `
  })
  @ApiResponse({
    type : CardListResponse
  })
  @Get('list/:business_id')
  async cardList(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() card : CardListDto,
    @Query() page : PaginationDto,
    @Query() div : CardApprDivDto
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
      const serviceData = await this.salesSvc.dayCardList(
        business,
        date,
        card,
        page,
        div
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '카드 검색',
    description : `
      5101 : server error
      4101 : businessId not match
      5000 : required query string[page , count]
    `
  })
  @ApiResponse({
    type : CardListResponse
  })
  @Get('search/:business_id')
  async cardSearch(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() card : CardListDto,
    @Query() page : PaginationDto,
    @Query('word') word : string,
    @Query() div : CardApprDivDto
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
      const serviceData = await this.salesSvc.cardSearch(
        business,
        date,
        card,
        page,
        word,
        div
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
