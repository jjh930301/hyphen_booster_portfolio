import { Injectable } from '@nestjs/common';
import { Constants } from 'src/constants/constants';
import { FcmType } from 'src/constants/fcm.type';
import { AdminUser } from 'src/entities/admin/admin.user.entity';
import { UserDevice } from 'src/entities/booster/user/user.device.entity';
import { IsPush } from 'src/enums/is.push';
import { ServiceData } from 'src/models';
import { FirebaseCloudMessage } from 'src/utils/firebase.cloud.message';
import { NaverUtil } from 'src/utils/naver.util';
import { DataSource } from 'typeorm';
import { BusinessAlertProvider } from '../user/business.alert.provider';
import { PaginationDto } from '../user/dto/pagination.dto';
import { UserDeviceProvider } from '../user/user.device.provider';
import { UserProvider } from '../user/user.provider';
import { AlertDto } from './dto/alert.dto';
import { AlertSearchDto } from './dto/alert.search.dto';
import { CreateAlertVO } from './vo/create.alert.vo';

@Injectable()
export class NotificationService {
  constructor(
    private readonly alertPvd : BusinessAlertProvider,
    private readonly devicePvd : UserDeviceProvider,
    private readonly datasource : DataSource,
  ){}

  public async image(
    admin : AdminUser,
    image : Express.Multer.File
  ) : Promise<ServiceData> {
    try {
      const naver = new NaverUtil();
      const data = await naver.sendImage(
        admin,
        `notification`,
        [image]
      )
      if(data[0]) {
        return ServiceData.ok(
          'Successfully uploaded image',
          {
            image : data[0]
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async createNotification(
    body : AlertDto,
    admin : AdminUser
  ) : Promise<ServiceData> {
    try {
      const vo = new CreateAlertVO(
        body.title , body.body , null , 1 , true , body.is_open
      )
      const noti = await this.alertPvd.createAlert(vo , admin ,body.push);
      if(body.push === IsPush.push && body.is_open === true) {
        if(Constants.ENV === 'production') {
          const devices : UserDevice[] = await this.devicePvd.findDevices()
          const titleBody = FcmType.MESSAGE_TYPE[FcmType.NOTIFICATION](body.title)
          devices.forEach((device) => {
            FirebaseCloudMessage.notification(titleBody.title , titleBody.body , '1' , device.token);
          })
        }
      }
      
      if(noti)
        return ServiceData.ok(
          'Successfully regist notification',
          {result : true},
          2101
        );
      return ServiceData.serverCrudError();
    } catch(e) {
      console.log(e)
      return ServiceData.serverError();
    }
  }

  public async changedAlert(id : string,body : AlertDto) : Promise<ServiceData> {
    
    try {
      let alert = await this.alertPvd.findById(id);
      if(alert.pushed_at && body.push === IsPush.push) {
        return ServiceData.ok('Cannot send fcm' , {result : false} , 2102)
      }
      alert.body = body.body,
      alert.title = body.title,
      alert.is_open = body.is_open
      if(body.push === IsPush.push) {
        alert.pushed_at = new Date();
        const devices : UserDevice[] = await this.devicePvd.findDevices()
        const titleBody = FcmType.MESSAGE_TYPE[FcmType.NOTIFICATION](body.title)
        devices.forEach((device) => {
          FirebaseCloudMessage.notification(titleBody.title , titleBody.body , '1' , device.token);
        })
      }

      return ServiceData.ok('Successfully changed public alert' , {result : true} , 2101)
    } catch(e) {
      return ServiceData.serverError()
    }
  }

  public async alerts(
    page : PaginationDto,
    search : AlertSearchDto
  ) : Promise<ServiceData> {
    try {
      const count = this.alertPvd.count(search);
      const alerts = this.alertPvd.findAllPublic(page , search);
      if(alerts) {
        return ServiceData.ok(
          'Successfully getting public alerts',
          {
            count : await count,
            alerts : await alerts
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async alert(
    id : string
  ) : Promise<ServiceData> {
    try {
      const alert = await this.alertPvd.findOne(id);
      if(alert) {
        return ServiceData.ok(
          'Successfully getting alert',
          {
            alert : alert
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