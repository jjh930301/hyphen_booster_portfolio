import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { CrefiaService } from './crefia.service';
import { CrefiaFeeResponse } from './response/crefia.fee.response';

@ApiTags('crefia')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class CrefiaController {
  constructor(
    private readonly crefiaSvc : CrefiaService
  ){}

  @ApiOperation({
    summary : '가맹점 번호'
  })
  @ApiResponse({
    type : CrefiaFeeResponse
  })
  @Get('/:business_id')
  async memberNumber(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'user',
        ).apiResponse(res).send();
      }
      const serviceData = await this.crefiaSvc.memberNumber(business);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
