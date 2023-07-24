import { Injectable } from '@nestjs/common';
import { FcmType } from 'src/constants/fcm.type';
import { SchemaNames } from 'src/constants/schema.names';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { UserDevice } from 'src/entities/booster/user/user.device.entity';
import { ServiceData } from 'src/models';
import { parseDashDate } from 'src/utils/date';
import { FirebaseCloudMessage } from 'src/utils/firebase.cloud.message';
import { DateRangeDto } from '../dashboard/dto/date.range.dto';
import { CreateAlertVO } from '../notification/vo/create.alert.vo';
import { BusinessAlertProvider } from '../user/business.alert.provider';
import { PaginationDto } from '../user/dto/pagination.dto';
import { InquiryProvider } from '../user/inquiry.provider';
import { UserBusinessProvider } from '../user/user.business.provider';
import { UserDeviceProvider } from '../user/user.device.provider';
import { AnswerDto } from './dto/answer.dto';
import { InquirySearchDto } from './dto/inquiry.search.dto';

@Injectable()
export class InquiryService {
  constructor(
    private readonly inquiryPvd : InquiryProvider,
    private readonly devicePvd : UserDeviceProvider,
    private readonly alertPvd : BusinessAlertProvider,
    private readonly businessPvd : UserBusinessProvider
  ){}

  public async inquiry(
    id : string
  ) : Promise<ServiceData> {
    try {
      const inquiry = await this.inquiryPvd.findOne(id , [
        `${SchemaNames.inquiries}.id`,
        `${SchemaNames.inquiries}.created_at`,
        `${SchemaNames.inquiries}.type`,
        `${SchemaNames.inquiries}.title`,
        `${SchemaNames.inquiries}.description`,
        `${SchemaNames.inquiries}.images`,
        `${SchemaNames.inquiries}.status`,
        `${SchemaNames.inquiries}.answer_admin`,
        `${SchemaNames.inquiries}.answer_title`,
        `${SchemaNames.inquiries}.answer_description`,
        `${SchemaNames.inquiries}.answered_at`,
        `${SchemaNames.users}.id`,
        `${SchemaNames.users}.name`,
        `${SchemaNames.users}.mobile`,
        `${SchemaNames.users}.user_num`,
      ])
      const business = await this.businessPvd.findBusinessesByUser(inquiry.user.id);
      if (business.length !== 0) {
        inquiry.user['business_count'] = business.length
      } else {
        inquiry.user['business_count'] = 0
      }
      if(inquiry) {
        return ServiceData.ok(
          'Successfully getting inquiry',
          {
            inquiry : inquiry
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async inquiries(
    page : PaginationDto,
    search : InquirySearchDto,
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      let startDate = null;
      let endDate = null;
      if(date.end_date && date.start_date) {
        startDate = parseDashDate(date.start_date);
        endDate = `${parseDashDate(date.end_date)} 23:59:59`;
      }
      const count = this.inquiryPvd.count(
        search,
        startDate,
        endDate
      );
      const inquiries = this.inquiryPvd.inquiries(
        page ,
        search,
        startDate,
        endDate
      )
      if(inquiries) {
        return ServiceData.ok(
          'Successfully getting user inquiries',
          {
            count : await count,
            inquiries : await inquiries
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async answer(
    userId : string,
    dto : AnswerDto
  ) : Promise<ServiceData> {
    try {
      const {user} = await this.inquiryPvd.findRawOne(dto.id , [`${SchemaNames.inquiries}.user AS user`]);
      await this.inquiryPvd.updateAnswer(userId , dto);
      const devices : UserDevice[] = await this.devicePvd.findDevicesByUser(user as unknown as string);
      const businesses : UserBusiness[] = await this.businessPvd.findBusinessesByUser(user as unknown as string);
      const {title , body} = FcmType.MESSAGE_TYPE[FcmType.INQUIRY]
      const vo = new CreateAlertVO(
        title , 
        body , 
        dto.id , 
        Number(FcmType.INQUIRY) , 
        false , 
        true
      );
      businesses.forEach(async business => {
        await this.alertPvd.createUserAlert(vo , business)
      })
      devices.forEach(device => {
        FirebaseCloudMessage.notification(
          title,
          body,
          String(FcmType.INQUIRY),
          device.token
        )
      })
      return ServiceData.ok(
        'Successfully comment to inquiry',
        {result : true},
        2101
      )
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
