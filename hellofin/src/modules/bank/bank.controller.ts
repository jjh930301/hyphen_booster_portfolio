import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DateRangeDto } from '../dto/date.rage.dto';
import { ApiRes } from 'src/models/api.response';
import { BankService } from './bank.service';
import { BankHistoryResponse } from './rseponse/bank.histtory.response';

@ApiTags('bank')
@ApiBearerAuth('bearer token')
@Controller()
export class BankController {

  constructor(
    private readonly bankSvc : BankService
  ){}

  @ApiOperation({
    summary : '경남은행 개인 계좌 내역',
    description : `
      2001 : 하이픈 데이터마켓 조회 성공
      2002 : 등록된 선정산 계좌가 없습니다.
      2003 : 등록된 선정산 계좌가 경남은행 계좌가 아닙니다.
      5001 : 하이픈 데이터마켓에서 데이터를 가져오지 못했습니다. [하이픈 에러메세지를 보여줍니다.]
    `
  })
  @ApiResponse({
    type : BankHistoryResponse
  })
  @Get('history/:business_uuid')
  async history(
    @Res() res,
    @Param('business_uuid') businessId : string,
    @Query() query : DateRangeDto
  ) {
    try {
      const serviceData = await this.bankSvc.history(businessId , query);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
