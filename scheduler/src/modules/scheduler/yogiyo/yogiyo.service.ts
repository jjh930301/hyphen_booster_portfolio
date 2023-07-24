import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Constants } from "src/constants/constants";
import { CronTime } from "src/constants/cron";
import { Endpoint } from "src/constants/endpoint";
import { FcmType } from "src/constants/fcm.type";
import { Urls } from "src/constants/urls";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { User } from "src/entities/booster/user/user.entity";
import { SelectHelper } from "src/helpers/select.helper";
import { CustomHttp } from "src/models/custom.http";
import { DeliveryDepositProvider } from "src/modules/booster/delivery.deposit.provider";
import { DeliveryProvider } from "src/modules/booster/delivery.provider";
import { DateRangeDto } from "src/modules/home/dto/date.range.dto";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { CreateAlertVO } from "src/modules/user/vo/create.alert.vo";
import { decrypt } from "src/utils/crypto";
import { datetimeNow, parseDate } from "src/utils/date";
import { FirebaseCloudMessage } from "src/utils/firebase.cloud.message";
import { SET_TIME, timeout } from "src/utils/timeout";

@Injectable()
export class YogiyoService {
  private readonly logger = new Logger('Yogiyo scheduler') 

  constructor(
    private readonly userPvd : UserProvider,
    private readonly deliveryPvd : DeliveryProvider,
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
    private readonly alertPvd : AlertProvider
  ){}

  @Cron(CronTime.yogiyo , {
    name : 'yogiyo',
    timeZone : 'Asia/Seoul'
  })
  async upsertYogiyo() {
    if(Constants.RUNNABLE) {
      const users = await this.userPvd.findJoinBizAll(SelectHelper.user_yogiyo_select , 'yogiyo_id')

      const now = new Date(new Date().setTime(new Date().getTime() + 9));

      const commonRange = new DateRangeDto();
      commonRange.start_date = parseDate(new Date(new Date().setDate(now.getDate() - 10)));
      commonRange.end_date = parseDate(now);
      users.forEach(user => {
        this.insertUser(user , commonRange);
      })
      this.logger.log('yogiyo update' , datetimeNow());
    }
  }

  private insertUser(
    user : User,
    date : DateRangeDto
  ) {
    user.businesses.forEach(async business => {
      this.insertBusiness(business , user.devices , date);
    })
  }

  private async insertBusiness(
    business : UserBusiness,
    devices : UserDevice[],
    date : DateRangeDto
  ) {
    if(!business.yogiyo_login) {
      if(business.yogiyo_id === null || business.yogiyo_password === null) return;
      let check = await this.checkYogiyo(business.yogiyo_id , business.yogiyo_password);
      await timeout();
      if(!check['errYn']) {
        check = await this.checkYogiyo(business.yogiyo_id , business.yogiyo_password);
      }
      // 로그인할 수 없는 계정일 경우
      const flag = String(check['common']['errMsg']).includes('로그인 할수 없습니다.')
      if(flag) {
        await this.userPvd.changedBusiness(
          business,
          {
            yogiyo_password : null,
          }
        )
        const titleBody = FcmType.MESSAGE_TYPE[FcmType.CHANGED_PASSWORD]["요기요"];
        const alertVO = new CreateAlertVO(
          titleBody.title,
          titleBody.body,
          business.id,
          Number(FcmType.CHANGED_PASSWORD),
          false
        )
        await this.alertPvd.createAlert(business , alertVO)
        devices.forEach(device => {
          if(device.token) {
            FirebaseCloudMessage.changedPassword(
              titleBody.title,
              titleBody.body,
              business.id,
              FcmType.CHANGED_PASSWORD,
              device.token
            )
          }
        })
        return
      }
      await this.userPvd.changedBusiness(
        business,
        {
          yogiyo_login : true
        }
      )
      await this.yogiyoSalesData(business , date);
      await timeout(SET_TIME)
      await this.yogiyoDepositData(business , date);
      await this.userPvd.changedBusiness(
        business,
        {
          yogiyo_login : false,
          yogiyo_recented_at : new Date(new Date().setHours(new Date().getHours() + 9))
        }
      )
    }
  }

  private async checkYogiyo(id : string, pw : string) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    
    return await http.post(
      Endpoint.YOGIYO_SHOP_INFO,
      {
        userId : id,
        userPw : await decrypt(pw),
        storeId : null
      }
    )
  }

  private async yogiyoSales(
    yogiyo_id : string,
    yogiyo_password : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
    process_YN : string | null = "N",
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    let yogiyos = await http.post(
      Endpoint.YOGIYO_SALES,
      {
        userId: yogiyo_id,
        userPw: yogiyo_password!,
        dateFrom: startDate,
        dateTo: endDate,
        bizNo : businessNumber,
        detailYn: "Y",
        detailListYn: "N",
        processYn: process_YN
      }
    );
    const yogiyoList = yogiyos['data']['touchOrderList'] as Array<Object>;
    // 데이터마켓 에러 같은데
    // if(!yogiyoList) {
    //   await timeout();
    //   yogiyos = await this.yogiyoSales(yogiyo_id , yogiyo_password , startDate , endDate , process_YN);
    // }
    return yogiyos;
  }

  private async yogiyoSalesData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.yogiyoSales(
        business.yogiyo_id,
        await decrypt(business.yogiyo_password),
        business.business_number,
        date.start_date,
        date.end_date
      );
      // 왜 데이터가 특정시점부터 안들어오는지 확인해야 함.
      if(data['error']) {
        // 토큰 값이 이상할 때 "error": "Authorization Error"
        await timeout();
        data = await this.yogiyoSales(
          business.yogiyo_id,
          await decrypt(business.yogiyo_password),
          business.business_number,
          date.start_date,
          date.end_date
        );
      }
      if(data['errYn'] === "") {
        // "" = ID , PW가 맞지 않을 떄 리턴
        await this.userPvd.changedBusiness(
          business , 
          {
            yogiyo_login : false
          }
        )
        return;
      }
      
      const list = data['data']['touchOrderList'] as Array<Object>;
      // const list = data as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          this.deliveryPvd.yogiyoUpsert(business,data);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          yogiyo_login : false
        }
      )
    }
  }

  private async yogiyoDeposit(
    yogiyo_id : string,
    yogiyo_password : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );

    let yogiyos = await http.post(
      Endpoint.YOGIYO_DEPOSIT,
      {
        userId: yogiyo_id,
        userPw: yogiyo_password!,
        dateFrom: startDate,
        dateTo: endDate,
        bizNo : businessNumber
      }
    );
    const yogiyoList = yogiyos['data']['calList'] as Array<Object>;
    // 데이터마켓 에러 같은데
    // if(!yogiyoList) {
    //   await timeout();
    //   yogiyos = await this.yogiyoDeposit(yogiyo_id , yogiyo_password , businessNumber ,startDate , endDate);
    // }
    return yogiyos;
  }

  private async yogiyoDepositData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.yogiyoDeposit(
        business.yogiyo_id,
        await decrypt(business.yogiyo_password),
        business.business_number,
        date.start_date,
        date.end_date
      );
      if(data['common']['errYn'] === "" || data['common']['errYn'] === "Y") {
        // "" = ID , PW가 맞지 않을 떄 리턴
        await this.userPvd.changedBusiness(
          business , 
          {
            yogiyo_login : false
          }
        )
        return;
      }
      const list = data['data']['calList'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          this.deliveryDepositPvd.yogiyoUpsert(business,data);
        })
      }
    } catch(e) {
      console.log(e)
      await this.userPvd.changedBusiness(
        business , 
        {
          yogiyo_login : false
        }
      )
    }
  }
}