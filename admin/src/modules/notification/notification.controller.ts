import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminUser } from 'src/entities/admin/admin.user.entity';
import { ApiRes } from 'src/models';
import { PaginationDto } from '../user/dto/pagination.dto';
import { AlertDto } from './dto/alert.dto';
import { AlertSearchDto } from './dto/alert.search.dto';
import { ImageSchema } from './dto/image.dto';
import { NotificationService } from './notification.service';
import { AlertsModel, AlertsResponse } from './response/alerts.response';

@ApiTags('notification')
@ApiBearerAuth('Required admin accessToken')
@Controller()
export class NotificationController {
  

  constructor(
    private readonly notiSvc : NotificationService
  ){}

  @ApiOperation({
    summary : '이미지 등록하기',
    description : `
      5101 : server error
    `
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody(ImageSchema)
  @Post('image')
  async image(
    @Req() req,
    @Res() res,
    @UploadedFile() image : Express.Multer.File
  ) {
    try {
      const serviceData = await this.notiSvc.image(req.admin , image);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return null;
    }
  }

  @ApiOperation({
    summary : '공지사항 등록하기',
    description : `
      5101 : server error
      5001 : crud error
    `
  })
  @ApiBody({
    type : AlertDto
  })
  @Post('')
  async registration(
    @Res() res,
    @Req() req,
    @Body() body : AlertDto
  ) {
    try {
      const admin : AdminUser = req.admin;
      const serviceData = await this.notiSvc.createNotification(body, admin);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString())
    }
  }

  @ApiOperation({
    summary : '공지사항 수정',
    description : `
      5101 : server error
      2102 : cannot send fcm
    `
  })
  @Put(':alert_id')
  async changedAlert(
    @Res() res,
    @Body() body : AlertDto,
    @Param('alert_id') id : string
  ) {
    try {
      const serviceData = await this.notiSvc.changedAlert(id , body)
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '공지사항 목록',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    type : AlertsResponse
  })
  @Get('')
  async alerts(
    @Res() res,
    @Query() page : PaginationDto,
    @Query() search : AlertSearchDto
  ) {
    try {
      const serviceData = await this.notiSvc.alerts(page , search)
      return serviceData.apiResponse(res).send()
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '공지사항 디테일',
    description : `
      5101 : server error
    `
  })
  @ApiResponse({
    type : AlertsModel
  })
  @Get(':id')
  async alert(
    @Res() res,
    @Param('id') id : string
  ) {
    try {
      const serviceData = await this.notiSvc.alert(id);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res,e.toString());
    }
  }
}
