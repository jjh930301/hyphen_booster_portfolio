import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { query } from 'express';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { ApiRes, ServiceData } from 'src/models';
import { DateRangeDto } from '../dto/date.rage.dto';
import { BankService } from './bank.service';
import { BankAccountDto } from './dto/bank.accont.dto';
import { RegistBankDto } from './dto/regist.bank.dto';
import { BankIdDto } from './dto/bank.id.dto';
import { AccountListResponse } from './response/account.list.response';
import { BankAccountListResponse } from './response/bank.account.list.response';
import { ConnectBankDto } from './dto/connect.bank.dto';
import { BankIdsDto } from './dto/bankids.dto';
import { BalanceResponse, HistoryResponse } from './response/balance.response';
import { AccountCalenderResponse } from './response/account.calendar.response';

@ApiTags('bank')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class BankController {
  constructor(
    private readonly bankSvc : BankService
  ){}

  @ApiOperation({
    summary : '개인 계좌 목록 조회 [하이픈 데이터 마켓]',
    description : `
      하이픈 데이터마켓에서 받아오는 response 그대로 주기 때문에 조금 느립니다.
      2102 : 데이터마켓 Error message
    `
  })
  @ApiResponse({
    type : AccountListResponse
  })
  @Post('account/list/:business_id')
  async accountList(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Body() body : BankAccountDto,
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
      const serviceData = await this.bankSvc.accountList(user , body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '개인 계좌 연결',
    description : `
      2102 : 이미 등록된 계좌
    `
  })
  @Post('account/:business_id')
  async account(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Body() body : RegistBankDto,
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
      const serviceData = await this.bankSvc.registAccount(user ,business , body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '계좌 목록 가져오기',
    description : `
      2102 empty account list`
  })
  @ApiResponse({
    type : BankAccountListResponse
  })
  @Get('account/:business_id')
  async bankAccountList(
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
      const serviceData = await this.bankSvc.bankAccountList(business);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
  
  @Delete('account/:bank_id')
  async deleteAccount(
    @Res() res,
    @Param('bank_id') bankId : string,
  ) {
    try {
      const serviceData = await this.bankSvc.deleteAccount(bankId);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '계좌에 공동인증서 , 계정 연결',
    description : ``
  })
  @Put('connect/:business_id')
  async connectAccoount(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Body() body : ConnectBankDto
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'calendar',
        ).apiResponse(res).send();
      }
      const serviceData = await this.bankSvc.connectAccount(user ,business , body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '잔액 조회',
    description : ``
  })
  @ApiResponse({
    type : BalanceResponse
  })
  @Get('balance/:business_id')
  async balance(
    @Res() res,
    @Param('business_id') businessId : string,
  ) {
    try {
      const serviceData = await this.bankSvc.balance(businessId);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '일별 계좌 조회(하이픈)',
    description : `
    
    `
  })
  @ApiResponse({
    type : AccountCalenderResponse
  })
  @Get('calendar/hyphen/:business_id')
  async hyphenBankCalendar(
    @Req() req,
    @Res() res,
    @Query() date : DateRangeDto,
    @Query() query : BankIdDto,
    @Param('business_id') businessId : string,
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'calendar',
        ).apiResponse(res).send();
      }
      const serviceData = await this.bankSvc.hyphenBankCalendar(business , query.bank_id , date)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString())
    }
  }

  @ApiOperation({
    summary : '일별 계좌 조회',
    description : `
    
    `
  })
  @ApiResponse({
    type : AccountCalenderResponse
  })
  @Get('calendar/:business_id')
  async bankCalendar(
    @Req() req,
    @Res() res,
    @Query() date : DateRangeDto,
    @Param('business_id') businessId : string,
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'calendar',
        ).apiResponse(res).send();
      }
      const serviceData = await this.bankSvc.bankCalendar(business , date)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString())
    }
  }

  @ApiOperation({
    summary : '거래 내역 조회(하이픈)',
    description : ``
  })
  @ApiResponse({
    type : HistoryResponse
  })
  @Get('history/hyphen/:business_id')
  async hyphenBankHistory(
    @Req() req,
    @Res() res,
    @Query() date : DateRangeDto,
    @Param('business_id') businessId : string,
    @Query() query : BankIdDto
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'calendar',
        ).apiResponse(res).send();
      }
      const serviceData = await this.bankSvc.hyphenBankHistory(business , query.bank_id , date)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString())
    }
  }

  @ApiOperation({
    summary : '거래 내역 조회',
    description : ``
  })
  @ApiResponse({
    type : HistoryResponse
  })
  @Get('history/:business_id')
  async bankHistory(
    @Req() req,
    @Res() res,
    @Query() date : DateRangeDto,
    @Param('business_id') businessId : string,
    @Query() query : BankIdDto
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'calendar',
        ).apiResponse(res).send();
      }
      const serviceData = await this.bankSvc.history(business , query.bank_id , date)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString())
    }
  }

  @ApiOperation({
    summary : '선정산 계좌 등록',
    deprecated :true,
    description : `
      선정산 계좌로 등록한 계좌를 제외한 나머지 계좌는 일반 계좌로 바뀝니다.
    `
  })
  @Put('account/paid/:business_id')
  async changedPaidAccount(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query('bank_id') bankId : string,
  ) {
    try {
      return ApiRes._500(res , 'cannot access');
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'user',
        ).apiResponse(res).send();
      }
      const serviceData = await this.bankSvc.changedPaidAccount(business ,bankId)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

}
