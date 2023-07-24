import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { DateRangeDto } from '../dto/date.rage.dto';
import { CertDto } from './dto/cert.dto';
import { CertListDto } from './dto/cert.list.dto';
import { CheckSsalesDto } from './dto/check.sales.dto';
import { OnedayServiceDto } from './dto/oneday.service.dto';
import { UpdateOrRemoveCertDto } from './dto/remove.cert.dto';
import CertList from './response/cert.list.response';
import { YLCardResponse } from './response/yl.card.response';
import { YLDeliveryResponse } from './response/yl.delivery.response';
import { YLDepositResponse } from './response/yl.deposit.response';
import { YLInfoResponse } from './response/yl.info.response';
import { UserService } from './user.service';

@ApiTags('user')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class UserController {
  constructor(
    private readonly userSvc : UserService
  ){}

  @ApiOperation({
    summary : '공동인증서 등록',
    description : `
      5101 : server error
      4103 : 사업자 확인 실패
      4101 : 공동인증서에 사업자 번호와 등록된 사업자 번호가 일치하지 않음
    `
  })
  @ApiResponse({
    description : `{result : true}`
  })
  @Post('cert')
  async cert(
    @Res() res,
    @Req() req,
    @Body() body : CertDto
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(body.business_id);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'user',
        ).apiResponse(res).send();
      }
      const serviceData = await this.userSvc.cert(user , business , body)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '홈택스 데이터 받아오기',
    description : `
      사업자 번호와 연동해서 홈택스 데이터를 받아옵니다.
      4001 : not found model
    `
  })
  @Put('cert/hometax')
  async connectCert(
    @Res() res,
    @Req() req,
    @Query() query : UpdateOrRemoveCertDto,
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(query.business_id);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'user',
        ).apiResponse(res).send();
      }
      query.business = business
      const serviceData = await this.userSvc.connectCert(req.user,query)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
  

  @ApiOperation({
    summary : '공동인증서 목록',
    description : `
      2102 : not found cert
    `
  })
  @ApiResponse({
    type : CertList
  })
  @Get('cert')
  async certList(
    @Res() res,
    @Req() req,
    @Query() query : CertListDto
  ) {
    try {
      const serviceData = await this.userSvc.certList(req.user , query.business_id);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      console.log(e)
      return ApiRes._500(res, e.toString());
    }
  }

  @ApiOperation({
    summary : '공동인증서 해지',
    description : `
    
    `
  })
  @ApiResponse({
    description : `{result : true}`
  })
  @Delete('cert')
  async deleteCert(
    @Res() res,
    @Req() req,
    @Query() dto : UpdateOrRemoveCertDto
  ) {
    try {
      const user : User = req.user;
      const serviceData = await this.userSvc.deleteCert(user,dto.business_id,dto.cert_number)
      return serviceData.apiResponse(res).send();
    }catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '영업단 id 확인',
    description : `
      5001 : http error
    `
  })
  @Get('check/sales')
  async checkSales(
    @Res() res,
    @Query() query : CheckSsalesDto,
  ) {
    try {
      const serviceData = await this.userSvc.checkSales(query.sales_id)
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '원데이 서비스 신청 여부 확인',
    description : `
      2102 : hello fintech id가 존재하지 않아서 가지고 올 수 없습니다.
    `,
  })
  @Get('check/store/:business_id')
  async checkStore(
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
      const serviceData = await this.userSvc.checkStore(business);
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '원데이 서비스 신청',
    description : ``
  })
  @Post('oneday/service/:business_id')
  async onedayService(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Body() body : OnedayServiceDto
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
      const serviceData = await this.userSvc.onedayService(user , business , body.sales_id)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '원데이 서비스 신청 정보',
    description : ``
  })
  @ApiResponse({
    type : YLInfoResponse
  })
  @Get('oneday/service/info/:business_id')
  async onedayServiceInfo(
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
      const serviceData = await this.userSvc.onedayServiceInfo(business);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : 'ylsolution 카드매출',
    description : ``
  })
  @ApiResponse({
    type : YLCardResponse
  })
  @Get('yl/card/:business_id')
  async ylsolutionCard(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
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
      const serviceData = await this.userSvc.ylsolutionCard(business , date);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : 'ylsolution 배달매출',
    description : ``
  })
  @ApiResponse({
    type : YLDeliveryResponse
  })
  @Get('yl/delivery/:business_id')
  async ylsolutionDelivery(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto
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
      const serviceData = await this.userSvc.ylsolutionDelivery(business , date);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : 'ylsolution 입금내역',
    description : ``
  })
  @ApiResponse({
    type : YLDepositResponse
  })
  @Get('yl/deposit/:business_id')
  async ylsolutionDeposit(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
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
      const serviceData = await this.userSvc.ylsolutionDeposit(business , date);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

}
