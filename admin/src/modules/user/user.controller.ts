import { Body, Headers ,Controller, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRes, ServiceData } from 'src/models';
import { DateRangeDto } from '../dashboard/dto/date.range.dto';
import { CrefiaService } from './crefia/crefia.service';
import { InsertDto } from './dto/insert.dto';
import { PaginationDto } from './dto/pagination.dto';
import { SearchDto } from './dto/search.dto';
import { UserStatusDto } from './dto/user.status.dto';
import { UserTypesDto } from './dto/user.types.dto';
import { HometaxService } from './hometax/hometax.service';
import { BaeminService } from './delivery/baemin.service';
import { DetailUserResponse } from './response/detail.user.response';
import { UsersResponse } from './response/users.response';
import { UserService } from './user.service';
import { TestBusinessDto } from './dto/test.business.dto';

@ApiTags('user')
@ApiBearerAuth('Required admin accessToken')
@Controller()
export class UserController {
  constructor(
    private readonly userSvc : UserService,
    private readonly crefiaSvc : CrefiaService,
    private readonly hometaxSvc : HometaxService,
    private readonly baeminSvc : BaeminService
  ){}

  @ApiOperation({
    summary : '회원 목록',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    type : UsersResponse
  })
  @Get('')
  async users(
    @Res() res,
    @Query() page : PaginationDto,
    @Query() date : DateRangeDto,
    @Query() types : UserTypesDto,
    @Query() search : SearchDto
  ) {
    try {
      if(4 < search.search) {
        return ServiceData.invalidRequest('check search key' , 4101).apiResponse(res).send();
      }
      const serviceData = await this.userSvc.users(
        page,
        date,
        types,
        search
      );
      return serviceData.apiResponse(res).send();
    }catch(e){
      return ApiRes._500(res,e.toString());
    }
  }

  @ApiOperation({
    summary : '회원 상세',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    type : DetailUserResponse
  })
  @Get(':id')
  async detailUser(
    @Res() res,
    @Param('id') id : string
  ) {
    try {
      const serviceData = await this.userSvc.detailUser(id)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '회원 상태 변경',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    description : `
      key는 result
      value는 입력한 값에 라 0 ~ 3입니다
      0 : 사용
      1 : 휴면
      2 : 정지
      3 : 탈퇴
    `
  })
  @Put('')
  async changedStatus(
    @Res() res,
    @Query('id') id : string,
    @Query() status : UserStatusDto,
  ) {
    try {
      const serviceData = await this.userSvc.changedStatus(id , status.status);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res,e.toString());
    }
  }
  @ApiOperation({
    summary : '여신금융협회 데이터 받아오기',
    description : `
      5101 : server error
      4101 : 계정이 일치하지 않는 경우
    `
  })
  @Post('crefia')
  async crefia(
    @Res() res,
    @Body() body : InsertDto
  ) {
    try {
      const serviceData = await this.crefiaSvc.crefia(body);
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '홈택스 데이터 받아오기',
    description : `
      5101 : server error
      4101 : 계정이 일치하지 않는 경우
    `
  })
  @Post('hometax')
  async hometax(
    @Res() res,
    @Body() body : InsertDto
  ) {
    try {
      const serviceData = await this.hometaxSvc.hometax(body);
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '배달의민족 데이터 받아오기',
    description : `
      5101 : server error
      4101 : 계정이 일치하지 않는 경우
    `
  })
  @Post('delivery')
  async delivery(
    @Res() res,
    @Body() body : InsertDto
  ) {
    try {
      const serviceData = await this.baeminSvc.baemin(body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : "테스트 사업자 등록"
  })
  @Post("test/business/:user_id")
  async testBusiness(
    @Res() res,
    @Headers() headers,
    @Body() body : TestBusinessDto,
    @Param('user_id') userId : string,
  ) {
    try {
      const serviceData = await this.userSvc.testBusiness(userId , body)
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
