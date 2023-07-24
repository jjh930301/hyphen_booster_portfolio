import { Body, Controller, Put, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiRes } from 'src/models';
import { OnedayResultDto } from './dto/oneday.result.dto';
import { UserService } from './user.service';

@ApiTags('user')
@ApiBearerAuth('bearer token')
@Controller()
export class UserController {

  constructor(
    private readonly userSvc : UserService
  ){}

  @ApiOperation({
    summary : '원데이 서비스 신청 결과',
    description : `
      2000 원데이서비스 등록 성공
      2001 반려 , 해지
      4000 경남은행 계좌를 생성하지 못했습니다.
      4001 사업자를 찾을 수 없습니다.
    `
  })
  @Put('onday')
  async paidResult(
    @Res() res,
    @Body() body : OnedayResultDto
  ) {
    try {
      const serviceData = await this.userSvc.paidResult(body);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
