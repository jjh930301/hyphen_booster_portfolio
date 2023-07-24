import { Injectable } from "@nestjs/common";
import { User } from "src/entities/booster/user/user.entity";
import { ServiceData } from "src/models";
import { InquiryProvider } from "./inquiry.provider";
import { NaverUtil } from 'src/utils/naver.util';
import { InquiryDto } from "./dto/inquiry.dto";
import { Inquiry } from "src/entities/booster/inquiry/inquiry.entity";
import { ModifyInquiryDto } from "./dto/modify.inquiry.dto";

@Injectable()
export class InquiryService {
  constructor(
    private readonly inquiryPvd : InquiryProvider
  ){}

  public async inquiry(
    user : User,
    body : InquiryDto,
    images : Array<Express.Multer.File>
  ) : Promise<ServiceData> {
    try {
      const naver = new NaverUtil();
      let data : string[] = [];
      if(images) {
        data = await naver.sendImage(
          user ,
          'inquiry',
          images
        );
      }

      const inquiry : Inquiry = await this.inquiryPvd.createInquiry(
        user , 
        body , 
        data
      );
      if(inquiry) 
        return ServiceData.ok(
          'Successfully create new inquiry',
          {
            result : true
          },
          2101
        )
      return ServiceData.invalidRequest('Cannot create inquiry');
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async modifiedInquiry(
    user : User,
    body : ModifyInquiryDto,
    images : Array<Express.Multer.File>,
  ) : Promise<ServiceData> {
    try {
      const naver = new NaverUtil();
      let data : Array<string> = [];
      if(images) {
        data = await naver.sendImage(
          user ,
          'inquiry',
          images
        );
      }
      let deleteImages : Array<string> = []
      if(body.delete_images) {
        deleteImages = JSON.parse(body.delete_images);
      }
      const inquiry = await this.inquiryPvd.findInquiry(body.id);
      let imgArr : Array<string> = inquiry.images;
      if(imgArr) {
        Promise.all(deleteImages.map((del) => {
          let idx = imgArr.indexOf(String(del));
          if(idx !== -1) {
            imgArr.splice(idx , 1);
          }
        }))
      }
      let arr : string[] = [];
      if(imgArr) {
        arr = [...imgArr , ...data];
      } else [
        arr = [...data]
      ]
      const updateInquiry = await this.inquiryPvd.modifiedInquiry(
        body,
        arr
      )
      const model = await this.inquiryPvd.findInquiry(body.id);
      if(updateInquiry) {
        return ServiceData.ok(
          'Successfully modified inquiry',
          {
            inquiry : model
          },
          2101
        );
      }
      return ServiceData.timeout();
    } catch(e) {
      console.log(e);
      return ServiceData.serverError();
    }
  }

  public async inquiries(
    user : User
  ) : Promise<ServiceData> {
    try {
      const inquiries : Array<Inquiry> = await this.inquiryPvd.findInquiries(user);
      if(inquiries) {
        return ServiceData.ok(
          'Successfully getting inquiries',
          {inquiries},
          2101
        )
      }
      return ServiceData.ok('Cannot found inquiries' , {inquiries} , 2102)
    } catch(e) {
      return ServiceData.serverError();
    }
  }
  public async deleteInquiry(
    inquiryId : string
  ) : Promise<ServiceData> {
    try {
      const inquiries = await this.inquiryPvd.deleteInquiry(inquiryId);
      if(inquiries) {
        return ServiceData.ok(
          'Successfully delete inquiry',
          {
            result : true
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}