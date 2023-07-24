import { Injectable } from "@nestjs/common";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { User } from "src/entities/booster/user/user.entity";
import { SelectHelper } from "src/helpers/select/select.helper";
import { ServiceData } from "src/models";
import { PaginationDto } from "src/modules/main/dto/pagination.dto";
import { DataSource } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { UserProvider } from "../user.provider";
import { AlertProvider } from "./alert.provider";
import { ChangedAlertDto } from "./dto/changed.alert.dto";

@Injectable()
export class AlertService {

  constructor(
    private readonly alertPvd : AlertProvider,
    private readonly userPvd : UserProvider,
    private readonly datasource : DataSource
  ){}

  public async alerts(
    business : UserBusiness,
    page : PaginationDto,
    type : number,
    device : UserDevice | null = null
  ) : Promise<ServiceData> {
    try {
      const alerts = await this.alertPvd.alerts(
        business,
        page,
        type,
        device
      );
      if(alerts) {
        return ServiceData.ok('Successfully getting alerts' , {alerts} , 2101);
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  async changedAlert(
    user: User,
    alerts : ChangedAlertDto
  ) : Promise<ServiceData> {
    try {
      const device : UserDevice = user.getDevice(alerts.device_id);
      const obj : QueryDeepPartialEntity<UserDevice> = {};
      if(!device) 
        return ServiceData.invalidRequest(`user has not ${alerts.device_id}`,4101 , 'user');
      console.log(alerts.card_sales_approval_alert)
      if(alerts.card_sales_approval_alert !== undefined) {
        obj.card_sales_approval_alert = alerts.card_sales_approval_alert
      }
      if(alerts.card_sales_cancel_alert !== undefined) {
        obj.card_sales_cancel_alert = alerts.card_sales_cancel_alert
      }
      if(alerts.cash_sales_approval_alert !== undefined) {
        obj.cash_sales_approval_alert = alerts.cash_sales_approval_alert
      }
      if(alerts.cash_sales_cancel_alert !== undefined) {
        obj.cash_sales_cancel_alert = alerts.cash_sales_cancel_alert
      }
      if(alerts.report_alert !== undefined) {
        obj.report_alert = alerts.report_alert
      }
      if(alerts.unpaid_unpurchase_alert !== undefined) {
        obj.unpaid_unpurchase_alert = alerts.unpaid_unpurchase_alert
      }
      await this.userPvd.changedDevice(device , obj)
      if(alerts.kakao_alert) {
        await this.userPvd.changedUser(user , {
          kakao_alert : alerts.kakao_alert
        })
      }

      const model = await this.userPvd.joinById(
        user.id,
        SelectHelper.user_select
      );
      if(model) {
        return ServiceData.ok(
          'Successfully changed alerts',
          {
            user : model
          },
          2101
        )
      }
      return ServiceData.timeout();

    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async readAll(ids : [string]) : Promise<void> {
    try {
      ids.forEach(id => {
        this.alertPvd.readAlert(id);
      })
    } catch(e) {
      console.log(e)
    }
  }
}