import { Body, Controller, Get, Param, Post, Req, Res , Request } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtHelper } from 'src/helpers/jwt.helper';
import { ApiRes, ServiceData } from 'src/models';
import { CrefiaService } from '../user/crefia/crefia.service';
import { AuthService } from './auth.service';
import { NewTokenDto } from './dto/newtoken.dto';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authSvc : AuthService,
    private readonly crefiaService : CrefiaService
  ){}

  @ApiOperation({
    summary : 'test',
    description : `
      5101 : server error
    `
  })
  @ApiParam({
    name : 'business_id'
  })
  @Get('test/:business_id')
  async createURL(
    @Res() res,
    @Param('business_id') businessId : string
  ) {
    try {
      const serviceData = await this.crefiaService.test(businessId);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '토큰 재생성',
    description : `
      5101 : server error
      4000 : user not found
      4002 : missing body
    `
  })
  @ApiBody({type : NewTokenDto})
  @Post('token')
  async refreshToken(
    @Req() req,
    @Res() res,
    @Body() body : NewTokenDto
  ) {
    try {
      if(!body) return ServiceData.missingRequestBody().apiResponse(res).send();
      const serviceData = await this.authSvc.getToken(
        body.id , 
        body.unique , 
        body.token_type
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
