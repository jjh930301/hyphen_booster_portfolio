import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRes } from 'src/models';
import { AdminService } from './admin.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.token.dto';
import { AdminResponse } from './response/admin.response';

@ApiTags('admin')
@Controller()
export class AdminController {

  constructor(
    private readonly adminSvc : AdminService
  ){}

  @ApiOperation({
    summary : '로그인',
    description : `
      5101 : server error
      4101 : 유저를 찾을 수 없습니다.
      4102 : 비밀번호 5회 이상 잘못입력,
      2102 : 비밀번호 잘못입력
    `
  })
  @ApiResponse({
    type : AdminResponse
  })
  @Post('login')
  public async login(
    @Res() res,
    @Body() admin : LoginDto
  ) {
    try {
      const serviceData = await this.adminSvc.login(admin);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }   
  }

  @ApiOperation({
    summary : 'refresh token',
    description : `
      5101 : server error
      2102 : Required login
    `
  })
  @ApiResponse({
    type : AdminResponse
  })
  @Post('token')
  public async token(
    @Res() res,
    @Body() body : RefreshTokenDto
  ) {
    try {
      const serviceData = await this.adminSvc.token(body.refresh_token);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
