import { Body, Controller, Get, Param, Put, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRes, ServiceData } from 'src/models';
import { DateRangeDto } from '../dashboard/dto/date.range.dto';
import { PaginationDto } from '../user/dto/pagination.dto';
import { ChangedMemberInfoDto } from './dto/changed.member.info.dto';
import { MemberSearchDto } from './dto/member.search.dto';
import { MemberService } from './member.service';
import { MemberListResponse } from './response/member.list.response';
import { MemberResponse } from './response/member.response';

@ApiTags('member')
@ApiBearerAuth('Required admin accessToken')
@Controller()
export class MemberController {
  constructor(
    private readonly memberSvc : MemberService
  ) {}

  @ApiOperation({
    summary : '관리자 목록',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    type : MemberListResponse
  })
  @Get('')
  async members(
    @Res() res,
    @Query() page : PaginationDto,
    @Query() date : DateRangeDto,
    @Query() search : MemberSearchDto
  ) {
    try {
      const serviceData = await this.memberSvc.members(page , date , search);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '관리자 정보 변경',
    description : `
      5101 : server error
      4001 : 최고 관리자가 아님
    `
  })
  @ApiResponse({
    description : '{result : true}'
  })
  @Put('')
  async changedInfo(
    @Res() res,
    @Req() req,
    @Body() values : ChangedMemberInfoDto
  ) {
    try {
      if(req.admin.type !== 0) {
        return ServiceData.cannotAccess('' , 4001).apiResponse(res).send();
      }
      const serviceData = await this.memberSvc.changedInfo(values);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '관리자 상세',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    type : MemberResponse
  })
  @Get(':id')
  async member(
    @Res() res,
    @Param('id') id : number
  ) {
    try {
      const serviceData = await this.memberSvc.member(id);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
