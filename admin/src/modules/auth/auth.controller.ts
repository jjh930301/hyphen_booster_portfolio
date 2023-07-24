import { Body, Controller, Post, Put, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminUser } from 'src/entities/admin/admin.user.entity';
import { AdminType } from 'src/enums/admin/admin.type';
import { ApiRes, ServiceData } from 'src/models';
import { RegistAdminDto } from './dto/regist.admin.dto';
import { AuthService } from './auth.service';
import { DefaultPasswordDto } from './dto/default.password.dto';
import { ChangedPasswordDto } from './dto/changed.password.dto';

@ApiTags('auth')
@ApiBearerAuth('Required admin accessToken')
@Controller()
export class AuthController {
  constructor(
    private readonly authSvc : AuthService
  ){}

  @ApiOperation({
    summary : '관리자 계정 등록',
    description : `
      5101 : server error
      5001 : 사용자 계정 || email 중복
      4004 : 최고 관리자만 사용할 수 있습니다.
    `
  })
  @Post('regist')
  async registAdmin(
    @Res() res,
    @Req() req,
    @Body() info : RegistAdminDto
  ) {
    try {
      const admin : AdminUser = req.admin;
      if(admin.type !== AdminType.super_administrator) 
        return ServiceData.invalidRequest('최고 관리자만 사용할 수 있습니다' , 4004)
          .apiResponse(res).send();
      const serviceData = await this.authSvc.registAdmin(info);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '비밀번호 초기화',
    description : `
      5101 : server error
      4004 : 최고 관리자만 사용할 수 있습니다.
    `
  })
  @Put('default/password')
  async defaultPassword(
    @Res() res,
    @Req() req,
    @Body() body : DefaultPasswordDto
  ) {
    try {
      const admin : AdminUser = req.admin;
      if(admin.type !== AdminType.super_administrator) 
        return ServiceData.invalidRequest('최고 관리자만 사용할 수 있습니다' , 4004)
          .apiResponse(res).send();
      const serviceData = await this.authSvc.defaultPassword(body.user_id);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '비밀번호 변경',
    description : `
      5101 : server error,
    `
  })
  @Put('password')
  async changedPassword(
    @Res() res,
    @Req() req,
    @Body() passwords : ChangedPasswordDto
  ) {
    try {
      const serviceData = await this.authSvc.changedPassword(req.admin , passwords);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
