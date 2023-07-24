import { Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
import { ApiRes, ServiceData } from "src/models";
import { DateRangeDto } from "../dto/date.range.dto";
import { PaginationDto } from "../dto/pagination.dto";
import { TaxDateTypeDto } from "./dto/tax.date.type.dto";
import { TaxTypeDto } from "./dto/tax.type.dto";
import { TaxDateResponse } from "./response/tax.date.response";
import { TaxListResponse } from "./response/tax.list.response";
import { TaxService } from "./tax.service";

@ApiTags('tax')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class TaxController {

  constructor(
    private readonly taxSvc : TaxService
  ){}

  @ApiOperation({
    summary : '기간별 세금 계산서',
    description : `
      5101 : server error,
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : TaxDateResponse
  })
  @Get('date/:business_id')
  async taxDate(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() query : DateRangeDto,
    @Query() type : TaxTypeDto
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
      const serviceData = await this.taxSvc.taxDate(
        business,
        query,
        type.type
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '기간별 세금 계산서 리스트',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : TaxListResponse
  })
  @Get('list/:business_id')
  async taxList(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() query : DateRangeDto,
    @Query() type : TaxTypeDto,
    @Query() dateType : TaxDateTypeDto,
    @Query() page : PaginationDto,
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
      const serviceData = await this.taxSvc.taxList(
        business,
        query,
        type,
        dateType,
        page
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '세금 계산서 검색',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : TaxListResponse
  })
  @Get('search/:business_id')
  async taxSearch(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() query : DateRangeDto,
    @Query() type : TaxTypeDto,
    @Query() dateType : TaxDateTypeDto,
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
      const serviceData = await this.taxSvc.taxList(
        business,
        query,
        type,
        dateType,
        page,
        word
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}