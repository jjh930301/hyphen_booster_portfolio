import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRes } from 'src/models';
import { PaginationDto } from '../main/dto/pagination.dto';
import { NotiListDto } from './dto/noti.list.dto';
import { NotiRegisterationDto } from './dto/noti.registration.dto';
import { NotificationService } from './notification.service';
import { NotificationsResponse } from './response/notifications.response';

@ApiTags('notification')
@ApiBearerAuth('Required user accessToken')
@Controller()
export class NotificationController {
  constructor(
    private readonly notiSvc : NotificationService
  ) {}

  // @ApiOperation({
  //   summary : '공지사항 등록하기',
  //   description : `
  //     5101 : server error
  //     5001 : crud error
  //   `
  // })
  // @ApiBody({
  //   type : NotiRegisterationDto
  // })
  // @Post('registration')
  // async registration(
  //   @Res() res,
  //   @Body() body : NotiRegisterationDto
  // ) {
  //   try {
  //     const serviceData = await this.notiSvc.createNotification(body);
  //     return serviceData.apiResponse(res).send();
  //   } catch(e) {
  //     return ApiRes._500(res , e.toString())
  //   }
  // }

  @ApiOperation({
    summary : '공지사항 목록',
    deprecated : true,
    description : `
      5101 : server error
      2102 : empty list
    `
  })
  @ApiResponse({
    type : [NotificationsResponse]
  })
  @Get('list')
  async notifications(
    @Res() res,
    @Query() query : PaginationDto
  ) {
    try {
      const serviceData = await this.notiSvc.notifications(query)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString())
    }
  }
}
