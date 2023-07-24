import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "src/entities/booster/user/user.entity";
import { ApiRes, ServiceData } from "src/models";
import { InquiryDto, InquirySchema } from "./dto/inquiry.dto";
import { ModifyInquiryDto, ModifyInquirySchema } from "./dto/modify.inquiry.dto";
import { InquiryService } from "./inquiry.service";
import { InquiryResponse } from './response/inquiry.response';

@ApiTags('inquiry')
@ApiBearerAuth('Required user accessToken')
@Controller()
export class InquiryController {

  constructor(
    private readonly inquirySvc : InquiryService
  ){}

  @ApiOperation({
    summary : '문의하기',
    description : `
      5101 : server error
      4001 : type = 1 required image
    `
  })
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiBody(InquirySchema)
  @Post()
  async inquiry(
    @Res() res,
    @Req() req,
    @UploadedFiles() images : Array<Express.Multer.File>,
    @Body() body : InquiryDto
  ) {
    try {
      if(body.type === 0 && images.length === 0) {
        return ServiceData
          .invalidRequest('Required regist business image' , 4001 , 'result')
          .apiResponse(res).send();
      }
      const user : User = req.user;
      const serviceData = await this.inquirySvc.inquiry(user , body , images);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '내 문의사항',
    description : `
      5101 : server error
    `
  })
  @Get()
  async inquiries(
    @Res() res,
    @Req() req,
  ) {
    try {
      const user : User = req.user;
      const serviceData = await this.inquirySvc.inquiries(user);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '문의 수정하기',
    description : `
      5101 : server error
    `
  })
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiBody(ModifyInquirySchema)
  @Put()
  @ApiResponse({
    type : InquiryResponse
  })
  async modifiedInquiry(
    @Res() res,
    @Req() req,
    @UploadedFiles() images : Array<Express.Multer.File>,
    @Body() body : ModifyInquiryDto
  ) {
    try {
      const user : User = req.user;
      const serviceData = await this.inquirySvc.modifiedInquiry(user , body , images);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '문의 삭제하기',
    description : `
      5101 : server error
    `
  })
  @Delete(':inquiry_id')
  async deleteInquiry(
    @Res() res,
    @Req() req,
    @Param('inquiry_id') inquiryId : string
  ) {
    try {
      const serviceData = await this.inquirySvc.deleteInquiry(inquiryId);
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

}