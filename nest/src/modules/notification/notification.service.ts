import { Injectable } from '@nestjs/common';
import { ServiceData } from 'src/models';
import { PaginationDto } from '../main/dto/pagination.dto';
import { AlertProvider } from '../user/alert/alert.provider';
import { CreateAlertVO } from '../user/alert/vo/create.alert.vo';
import { NotiListDto } from './dto/noti.list.dto';
import { NotiRegisterationDto } from './dto/noti.registration.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly alertPvd : AlertProvider
  ){}

  // public async createNotification(
  //   body : NotiRegisterationDto
  // ) : Promise<ServiceData> {
  //   try {

  //     const noti = await this.alertPvd.createAlert(null , new CreateAlertVO(
  //       '공지사항',
  //       '내용',
  //       null,
  //       null,
  //       true
  //     ));
  //     if(noti)
  //       return ServiceData.ok(
  //         'Successfully regist notification',
  //         {noti},
  //         2101
  //       );
  //     return ServiceData.serverCrudError();
  //   } catch(e) {
  //     return ServiceData.serverError();
  //   }
  // }

  public async notifications(
    query : PaginationDto
  ) : Promise<ServiceData> {
    try {
      const notifications = await this.alertPvd.notifications(query);
      return ServiceData.ok(
        'Successfully getting notification list',
        {
          notifications : notifications
        },
        notifications.length !== 0 ? 2101 : 2102
      )
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
