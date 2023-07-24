import { Body, Controller, Post, Req, Res , Put, Param, Query, Get, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { UserDevice } from 'src/entities/booster/user/user.device.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { DeliveryService } from '../main/delivery/delivery.service';
import { CrefiaService } from './crefia/crefia.service';
import { AccountTypeDto } from './dto/account.type.dto';
import { AgreeDto } from './dto/agree.dto';
import { ChangedBusinessNameDto } from './dto/changed.business.name.dto';
import { ChangedDeviceNameDto } from './dto/changed.device.name.dto';
import { ChangedDevicePasswordDto } from './dto/changed.device.password.dto';
import { ChangedTokenDto } from './dto/changed.token.dto';
import { CheckPasswordDto } from './dto/check.password.dto';
import { RegistBaeminDto } from './dto/regist.baemin.dto';
import { RegistBusinessDto } from './dto/regist.business.dto';
import { RegistCrefiaDto } from './dto/regist.crefia.dto';
import { RegistHometaxAccountDto } from './dto/regist.hometax.account.dto';
import { RegistHometaxDto } from './dto/regist.hometax.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { HometaxService } from './hometax/hometax.service';
import { BusinessResponse } from './response/business.response';
import { DeviceResponse } from './response/device.response';
import { UserService } from './user.service';

@ApiTags('user')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class UserController {
  constructor(
    private readonly userSvc : UserService,
    private readonly crefiaSvc : CrefiaService,
    private readonly hometaxSvc : HometaxService,
    private readonly deliverySvc : DeliveryService
  ){}

  @ApiOperation({
    summary : '디바이스 정보',
    description : `
      5101 : server error
      4101 : required device_id
    `
  })
  @ApiResponse({
    type : DeviceResponse
  })
  @Get('device/:device_id')
  async device(
    @Res() res,
    @Param('device_id') deviceId : string
  ) {
    if(!deviceId) return ServiceData.invalidRequest('missing device_id' , 4101)
    try {
      const serviceData = await this.userSvc.device(deviceId);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '사업자 상제 정보',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    type : BusinessResponse
  })
  @Get('business/:id')
  async detailBusiness(
    @Res() res,
    @Param('id') id : string
  ) {
    try {
      const serviceData = await this.userSvc.detailBusiness(id);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : 'ksnet 유저 확인',
    description : `
      5101 : server error
      2000 : ksnet user
      2102 : not found
    `
  })
  @Get('ksnet/:business_id')
  async checkKsnet(
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
      const serviceData = await this.userSvc.checkKsnet(business);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : 'ksnet 사용자 등록',
    description : `
      5101 : server error
      4101 : business id not match
      2102 : disagree
      2103 : not found ksnet member
      5001 : http error [pos server] or ksnet token is expired 다시시도
    `
  })
  @Put('ksnet/:business_id')
  async registKsnet(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() agree : AgreeDto
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
      const serviceData = await this.userSvc.registKsnet(user , business , agree.is_agree);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : "ksnet 사용자 등록 해제 [실시간 매출을 더이상 받아오지 않습니다.]",
    description : `
      5101 : server error
      4101 : business id not match
      2103 : not found ksnet member
      5001 : http error [pos server] or ksnet token is expired 다시시도
    `
  })
  @Delete('ksnet/:business_id')
  async removeKsnet(
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
      const serviceData = await this.userSvc.removeKsnet(user , business);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '연동 계정 해지',
    description : `
      5101 : server error
      4101 : business id not match
      4104 : 타입을 잘못 입력한 경우
    `
  })
  @ApiResponse({
    description : 'User model'
  })
  @Put('disconnect/:business_id')
  async disconnectAccount(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() type : AccountTypeDto
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
      const serviceData = await this.userSvc.disconnectAccount(
        business , 
        user ,
        type.account_type
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '사업장명 변경',
    description : `
      5101 : server error
    `
  })
  @Put('business/name')
  async changedBusinessName(
    @Res() res,
    @Req() req,
    @Body() body : ChangedBusinessNameDto
  ) {
    try {
      const serviceData = await this.userSvc.changedBusinessInfo(req.user , body)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '디바이스 토큰 변경',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    description : `result : true`
  })
  @Put('device/token')
  async changedDeviceToken(
    @Res() res,
    @Req() req,
    @Body() body : ChangedTokenDto
  ) {
    try {
      const serviceData = await this.userSvc.changedDeviceInfo(req.user , body)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '디바이스 네임 변경',
    description : `
      5101 : server error
      4101 : device not found
    `
  })
  @ApiResponse({
    description : 'User model'
  })
  @Put('device/name')
  async changedDeviceName(
    @Res() res,
    @Req() req,
    @Body() body : ChangedDeviceNameDto,
  ) {
    try {
      const serviceData = await this.userSvc.changedDeviceInfo(req.user , body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '사업자 번호 등록',
    description : `
      tax_type
      1 부가가치세 일반과세자 
      2 부가가치세 간이과세자 
      3 부가가치세 면세과세자 
      6 비영리법인 
      7 부가가치세 과특사업자
      5101 : server error
      4104 : 유효하지 않은 사업자 번호
      4103 : 사업자 번호 | 이름 | 개업일이 일치하지 않음
      2102 : 유저에 이미 등록된 사업자 번호
      2103 : 이미 등록된 사업자 번호
      ** 2000 : ksnet 유저임으로 ksnet 데이터 가지고 오는 화면으로 이동
    `
  })
  @ApiBody({
    type : RegistBusinessDto
  })
  @ApiResponse({
    description : 'User model'
  })
  @Post('business')
  async business(
    @Res() res,
    @Req() req,
    @Body() body : RegistBusinessDto
  ) {
    try {
      const serviceData = await this.userSvc.business(req.user , body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '여신금융 ID/PW 등록',
    description : `
      5101 : server error
      4101 : 여신금융협회에 등록되어 있는 사업자 번호와 등록된 사업자 번호가 일치하지 않음
      4104 : 여신 id / pw 맞지 않을 때
    `
  })
  @ApiResponse({
    description : 'User model'
  })
  @ApiBody({
    type : RegistCrefiaDto
  })
  @Post('regist/crefia')
  async registCrefia(
    @Res() res,
    @Req() req,
    @Body() body : RegistCrefiaDto
  ) {
    try {
      const serviceData = await this.crefiaSvc.registCrefia(req.user , body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '홈택스 계정 등록 ',
    description : `
      5101 : sever error,
      5000 : empty body values,
      4104 : hyphen error message snackbar
    `
  })
  @ApiBody({
    type : RegistHometaxAccountDto
  })
  @ApiResponse({
    description : 'User model'
  })
  @Post('regist/hometax/account')
  async registHometaxAccount(
    @Res() res,
    @Req() req,
    @Body() body : RegistHometaxAccountDto
  ) {
    try {
      const serviceData = await this.hometaxSvc.registHometaxAccount(req.user , body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '배달의민족 계정 등록',
    description : `
      배달의민족은 사업자번호를 받을 수 없어서 param에 business_id를 넣어야 합니다.
      5101 : server error
      4101 : business id not match
      4104 : hyphen error message 그대로 출력
    `
  })
  @ApiBody({
    type : RegistBaeminDto
  })
  @Post('regist/baemin/account/:business_id')
  async registBaeminAccount(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Body() body : RegistBaeminDto
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
      const serviceData = await this.deliverySvc.registBaemin(req.user , body , business);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString())
    }
  }

  @ApiOperation({
    summary : '사업장 삭제',
    description : `
      5101 : server error
    `
  })
  @Delete('business/:id')
  async removeBusiness(
    @Res() res,
    @Req() req,
    @Param('id') id : string
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(id);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'user',
        ).apiResponse(res).send();
      }
      const serviceData = await this.userSvc.removeBusiness(business);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res,e.toString());
    }
  }

  @ApiOperation({
    summary : '로그아웃 [디바이스 삭제]',
    description : `
      5101 : server error
      4101 : not found device_id
    `
  })
  @ApiBody({
    schema : {
      type : 'object',
      properties : {
        deviceId : {
          type : 'string'
        }
      }
    }
  })
  @ApiResponse({
    description : '{result : true}'
  })
  @Delete('device')
  async logout(
    @Res() res,
    @Body('deviceId') deviceId
  ) {
    try {
      const serviceData = await this.userSvc.logout(deviceId);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res, e.toString());
    }
  }

  @ApiOperation({
    summary : '회원탈퇴',
    description : `
      5101 : server error
    `
  })
  @Delete()
  async removeUser(
    @Req() req,
    @Res() res,
    @Body() body : WithdrawDto
  ) {
    try {
      const serviceData = await this.userSvc.removeUser(req.user , body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '비밀번호 등록 / 변경',
    description : `
      5101 : server error
      4101 : device not found
    `,
    deprecated : true
  })
  @ApiResponse({
    description : 'User model'
  })
  @Put('device/password')
  async changedDevicePassword(
    @Res() res,
    @Req() req,
    @Body() body : ChangedDevicePasswordDto
  ) {
    try {
      const serviceData = await this.userSvc.changedDeviceInfo(req.user , body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }


  @ApiOperation({
    summary : '비밀번호 확인',
    description : `
      4004 : 비밀번호 변경 필요
      4001 : 비밀번호 확인 필요
      4101 : device not found
    `,
    deprecated : true
  })
  @ApiResponse({
    schema : {
      properties : {
        result : {
          type : 'number',
          default : 1,
          description : `
            fail count
            success : 100,
            failure : 101
          `
        }
      }
    }
  })
  @Post('device/password')
  async checkPassword(
    @Res() res,
    @Req() req,
    @Body() body : CheckPasswordDto
  ) {
    try {
      const device : UserDevice = req.user.getDevice(body.device_id);;
      const serviceData = await this.userSvc.checkPassword(device , body.password);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '홈택스 인증서 등록',
    deprecated : true,
    description : `
      5101 : server error
      5000 : empty body values
      4104 : hyphen error message 그대로 출력
      4101 : 사업자 홈택스 인증서만 등록할 수 있습니다.
    `
  })
  @ApiResponse({
    description : 'User model'
  })
  @ApiBody({
    type : RegistHometaxDto
  })
  @Post('regist/hometax/cert')
  async registHometaxCertification(
    @Res() res,
    @Req() req,
    @Body() body : RegistHometaxDto
  ) {
    try {
      const serviceData = await this.hometaxSvc.registHometaxCertification(req.user , body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
