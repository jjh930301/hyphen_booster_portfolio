import { Body, Controller, Get, Param, Put, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRes } from 'src/models';
import { DateRangeDto } from '../dashboard/dto/date.range.dto';
import { PaginationDto } from '../user/dto/pagination.dto';
import { AnswerDto } from './dto/answer.dto';
import { InquirySearchDto } from './dto/inquiry.search.dto';
import { InquiryService } from './inquiry.service';
import { InquiriesModel, InquiriesResponse } from './response/inquiries.response';

@ApiTags('inquiry')
@ApiBearerAuth('Required admin accessToken')
@Controller()
export class InquiryController {
  constructor(
    private readonly inquirySvc : InquiryService
  ){}

  @ApiOperation({
    summary : '문의사항 목록',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    type : InquiriesResponse
  })
  @Get()
  async inquiries(
    @Res() res,
    @Query() date : DateRangeDto,
    @Query() page : PaginationDto,
    @Query() search : InquirySearchDto
  ) {
    try {
      const serviceData = await this.inquirySvc.inquiries(page , search , date)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '문의사항 디테일',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    type : InquiriesModel
  })
  @Get(':id')
  async inquiry(
    @Res() res,
    @Param('id') id : string
  ) {
    try {
      const serviceData = await this.inquirySvc.inquiry(id);
      return serviceData.apiResponse(res).send();
    } catch(e){
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '답변하기',
    description : `
      5101 : server error
    `
  })
  @Put()
  async answer(
    @Res() res,
    @Req() req,
    @Body() body : AnswerDto
  ) {
    try {
      const serviceData = await this.inquirySvc.answer(req.admin.user_id , body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
