import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { CardListDto } from '../dto/card.list.dto';
import { DateRangeDto } from '../dto/date.range.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { CardSalesDto } from './dto/card.sales.dto';
import { PurchaseService } from './purchase.service';
import { PurchaseCardResponse } from './response/purchase.card.response';
import { PurchaseDateResponse } from './response/purchase.date.response';
import { PurchaseListResponse } from './response/purchase.list.response';
import { PurchaseDetailResponse } from './response/purchase.detail.response';

@ApiTags('purchase')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class PurchaseController {

  constructor(
    private readonly purchaseSvc : PurchaseService
  ){}

  @ApiOperation({
    summary : '카드 매출로 입금 예정 상세',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    type : PurchaseDetailResponse
  })
  @Get('detail/:business_id')
  async detailPurchase(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() query : CardSalesDto
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
      const serviceData = await this.purchaseSvc.detaailPurchase(business ,query)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '기간별 입금 예정 내역 일별 조회',
    description : `
      5101 : server error,
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : PurchaseDateResponse
  })
  @Get('date/:business_id')
  async purchaseDate(
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
      const serviceData = await this.purchaseSvc.purchaseDate(
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
    summary : '카드별 입금 예정 내역 조회',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : PurchaseCardResponse
  })
  @Get('card/:business_id')
  async purchaseCard(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() query : DateRangeDto,
    @Query() list : CardListDto
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
      const serviceData = await this.purchaseSvc.purchaseDate(
        business,
        query,
        1,
        list
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res, e.toString());
    }
  }

  @ApiOperation({
    summary : '입금 예정 내역 리스트',
    description : `
      5101 : server error
      4101 : businessId not match
      5000 : required query string[page , count]
    `
  })
  @ApiResponse({
    type : PurchaseListResponse
  })
  @Get('list/:business_id')
  async purchaseList(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() cards : CardListDto,
    @Query() page : PaginationDto
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
      const serviceData = await this.purchaseSvc.purchaseList(
        business,
        date,
        cards,
        page
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '입금 예정 카드 검색',
    description : `
      5101 : server error
      4101 : businessId not match
      5000 : required query string[page , count]
    `
  })
  @ApiResponse({
    type : PurchaseListResponse
  })
  @Get('search/:business_id')
  async purchaseSearch(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() purchase : CardListDto,
    @Query() query : DateRangeDto,
    @Query() page : PaginationDto,
    @Query('word') word : string
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
      const serviceData = await this.purchaseSvc.purchaseSearch(
        business,
        query,
        purchase,
        page,
        word
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

}
