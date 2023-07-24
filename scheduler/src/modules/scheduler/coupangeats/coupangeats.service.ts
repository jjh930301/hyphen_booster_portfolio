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
export class CoupangeatsService {
  private readonly logger = new Logger('Coupangeats scheduler') 

  constructor(
    private readonly userPvd : UserProvider,
    private readonly deliveryPvd : DeliveryProvider,
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
    private readonly alertPvd : AlertProvider
  ){}

  @Cron(CronTime.coupangeats , {
    name : 'coupangeats',
    timeZone : 'Asia/Seoul'
  })
  async upsertCoupangeats() {
    if(Constants.RUNNABLE) {
      const users = await this.userPvd.findJoinBizAll(SelectHelper.user_coupange_select , 'coupange_id')

      const now = new Date(new Date().setTime(new Date().getTime() + 9));

      const commonRange = new DateRangeDto();
      commonRange.start_date = parseDate(new Date(new Date().setDate(now.getDate() - 10)));
      commonRange.end_date = parseDate(now);
      users.forEach(user => {
        this.insertUser(user , commonRange);
      })
      this.logger.log('coupangeats update' , datetimeNow());
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
    if(!business.coupange_login) {
      if(business.coupange_id === null || business.coupange_password === null) return;
      let check = await this.checkCoupangEats(business.coupange_id , business.coupange_password);
      await timeout();
      if(!check['errYn']) {
        check = await this.checkCoupangEats(business.coupange_id , business.coupange_password);
      }
      const flag = String(check['common']['errMsg']).includes('입력하신 아이디/비밀번호가 맞지 않습니다')
      if(flag) {
        await this.userPvd.changedBusiness(
          business , 
          {
            coupange_password : null,
          }
        )
        const titleBody = FcmType.MESSAGE_TYPE[FcmType.CHANGED_PASSWORD]["쿠팡이츠"];
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
          coupange_login : true
        }
      )
      await this.coupangEatsSalesData(business , date)
      await timeout(SET_TIME)
      await this.coupangEatsDepositData(business , date)
      await this.userPvd.changedBusiness(
        business,
        {
          coupange_login : false,
          coupange_recented_at : new Date(new Date().setHours(new Date().getHours() + 9))
        }
      )
      console.log('done')
    }
  }

  private async checkCoupangEats(id : string , pw : string) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    
    return await http.post(
      Endpoint.COUPANG_EATS_SHOP_INFO,
      {
        userId : id,
        userPw : await decrypt(pw),
        storeId : null
      }
    )
  }

  private async coupangEatsSales(
    coupange_id : string,
    coupange_password : string,
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
    let coupangs = await http.post(
      Endpoint.COUPANG_EATS_SALES,
      {
        userId: coupange_id,
        userPw: coupange_password!,
        dateFrom: startDate,
        dateTo: endDate,
        bizNo : businessNumber,
        detailYn: "Y",
        detailListYn: "N",
        processYn: process_YN
      }
    );
    const coupangList = coupangs['data']['touchOrderList'] as Array<Object>;
    if(!coupangList) {
      await timeout();
      coupangs = await this.coupangEatsSales(coupange_id , coupange_password , startDate , endDate , process_YN);
    }
    return coupangs;
  }

  private async coupangEatsSalesData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.coupangEatsSales(
        business.coupange_id,
        await decrypt(business.coupange_password),
        business.business_number,
        date.start_date,
        date.end_date
      );
      
      if(data['error']) {
        // 토큰 값이 이상할 때 "error": "Authorization Error"
        await timeout();
        data = await this.coupangEatsSales(
          business.coupange_id,
          await decrypt(business.coupange_password),
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
            coupange_login : false
          }
        )
        return;
      }
      
      const list = data['data']['touchOrderList'] as Array<Object>;
      // const list = data as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          this.deliveryPvd.coupangEatsUpsert(business,data);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          coupange_login : false
        }
      )
    }
  }

  private async coupangEatsDeposit(
    coupange_id : string,
    coupange_password : string,
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

    let coupangs = await http.post(
      Endpoint.COUPANG_EATS_DEPOSIT,
      {
        userId: coupange_id,
        userPw: coupange_password!,
        dateFrom: startDate,
        dateTo: endDate,
        bizNo : businessNumber
      }
    );
    const coupangList = coupangs['data']['calList'] as Array<Object>;

    if(!coupangList) {
      await timeout();
      coupangs = await this.coupangEatsDeposit(coupange_id , coupange_password , businessNumber ,startDate , endDate);
    }
    return coupangs;
  }

  private async coupangEatsDepositData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.coupangEatsDeposit(
        business.coupange_id,
        await decrypt(business.coupange_password),
        business.business_number,
        date.start_date,
        date.end_date
      );
      
      if(data['common']['errYn'] === "" || data['common']['errYn'] === "Y") {
        // "" = ID , PW가 맞지 않을 떄 리턴
        await this.userPvd.changedBusiness(
          business , 
          {
            coupange_login : false
          }
        )
        return;
      }
      const list = data['data']['calList'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          this.deliveryDepositPvd.coupangEatsUpsert(business,data);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          coupange_login : false
        }
      )
    }
  }
}