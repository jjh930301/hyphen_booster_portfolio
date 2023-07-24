import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { PaginationDto } from '../dto/pagination.dto';
import { UnpurchaseListResponse } from './response/unpurchase.list.response';
import { UnpurchaseService } from './unpurchase.service';

@ApiTags('unpurchase')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class UnpurchaseController {

  constructor(
    private readonly unpurchaseSvc : UnpurchaseService
  ){}

  @ApiOperation({
    summary : '미매입 리스트',
    description : `
      5101 : server error
      4101 : business id not match,
      5000 : required query string[page , count]
    `
  })
  @ApiResponse({
    type : UnpurchaseListResponse
  })
  @Get('list/:business_id')
  async unpurchase(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
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
      const serviceData = await this.unpurchaseSvc.unpurhcase(business , page);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
