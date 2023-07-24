import { Body, Controller, Param, Post, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
import { ApiRes, ServiceData } from "src/models";
import { CoupangService } from "./coupang.service";
import { AccountDto } from "./dto/account.dto";
import { YogiyoService } from "./yogiyo.service";


@ApiTags('delivery')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class DeliveryController {
  constructor(
    private readonly yogiyoSvc : YogiyoService,
    private readonly coupangSvc : CoupangService
  ){}

  @ApiOperation({
    summary : '요기요 계정 등록',
    description : `
      5101 server error
      4101 not found business
      4104 hyphen data market error
    `
  })
  @ApiResponse({})
  @Post('regist/yogiyo/account/:business_id')
  async yogiyo(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Body() body : AccountDto
  ) {
    const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'user',
        ).apiResponse(res).send();
      }
    try {
      const serviceData = await this.yogiyoSvc.yogiyo(user , business ,body)
      return serviceData.apiResponse(res).send();
    }catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '쿠팡 계정 등록',
    description : `
      5101 server error
      4101 not found business
      4104 hyphen data market error
    `
  })
  @ApiResponse({})
  @Post('regist/coupang/account/:business_id')
  async coupangEats(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Body() body : AccountDto
  ) {
    const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'user',
        ).apiResponse(res).send();
      }
    try {
      const serviceData = await this.coupangSvc.coupangEats(user , business , body)
      return serviceData.apiResponse(res).send();
    }catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}