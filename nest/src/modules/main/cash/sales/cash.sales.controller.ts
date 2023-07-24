import { Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
import { ApiRes, ServiceData } from "src/models";
import { DateRangeDto } from "../../dto/date.range.dto";
import { PaginationDto } from "../../dto/pagination.dto";
import { TypeDto } from "../../dto/type.dto";
import { CashSalesService } from "./cash.sales.service";
import { CashSalesDateResponse } from "./response/cash.sales.date.response";
import { CashSalesListResponse } from "./response/cash.sales.list.response";

@ApiTags('cash/sales')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class CashSalesController {

  constructor(
    private readonly cashSvc : CashSalesService
  ) {}

  @ApiOperation({
    summary : '기간별 현금 매출',
    description : `
      5101 : server error,
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : CashSalesDateResponse
  })
  @Get('date/:business_id')
  async cashDate(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() query : DateRangeDto
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'sales',
        ).apiResponse(res).send();
      }
      const serviceData = await this.cashSvc.cashDate(
        business,
        query
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '기간별 현금 매출 건별 조회',
    description : `
      5101 : server error,
      4101 : businessId not match
      5000 : required query string[page , count]
    `
  })
  @ApiResponse({
    type : CashSalesListResponse
  })
  @Get('list/:business_id')
  async cashList(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() page : PaginationDto,
    @Query() type : TypeDto
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
      const serviceData = await this.cashSvc.cashList(
        business,
        date,
        page,
        type
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
  @ApiOperation({
    summary : '현금 매출 검색',
    description : `
      5101 : server error
      4101 : businessId not match
      5000 : required query string[page , count]
    `
  })
  @ApiResponse({
    type : CashSalesListResponse
  })
  @Get('search/:business_id')
  async cashSearch(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() page : PaginationDto,
    @Query() type : TypeDto,
    @Query('word') word : string
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

      const serviceData = await this.cashSvc.cashList(
        business,
        date,
        page,
        type,
        word
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}