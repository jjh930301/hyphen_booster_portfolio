import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AxiosResponse } from "@nestjs/terminus/dist/health-indicator/http/axios.interfaces";
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
import { TokenProvider } from "src/modules/booster/token.provider";
import { DateRangeDto } from "src/modules/home/dto/date.range.dto";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { CreateAlertVO } from "src/modules/user/vo/create.alert.vo";
import { decrypt } from "src/utils/crypto";
import { datetimeNow, parseDate } from "src/utils/date";
import { FirebaseCloudMessage } from "src/utils/firebase.cloud.message";
import { hyphenTokenRefresh } from "src/utils/hyphen.token.refresh";
import { SET_DAY, SET_TIME, timeout } from "src/utils/timeout";

@Injectable()
export class BaeminService {
  private readonly logger = new Logger('Baemin scheduler');

  constructor(
    private readonly userPvd : UserProvider,
    private readonly tokenPvd : TokenProvider,
    private readonly deliveryPvd : DeliveryProvider,
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
    private readonly alertPvd : AlertProvider
  ) {}

  @Cron(CronTime.baemin , {
    name : 'baemin',
    timeZone : 'Asia/Seoul'  
  })
  async upsertBaeminata() {
    if(Constants.RUNNABLE) {
      const users = await this.userPvd.findJoinBizAll(SelectHelper.user_baemin_select , 'baemin_id');
      //local time
      const now = new Date(new Date().setTime(new Date().getTime() + 9));

      const commonRange = new DateRangeDto();
      commonRange.start_date = parseDate(new Date(new Date().setDate(now.getDate() - 10)));
      commonRange.end_date = parseDate(now);
      users.forEach(user => {
        this.insertUser(user , commonRange);
      });
      this.logger.log('baemin update' , datetimeNow());
    }
  }

  private insertUser(
    user : User,
    date : DateRangeDto
  ) {
    user.businesses.forEach(async business => {
      this.insertBusiness(business , user.devices ,date);
    })
  }

  private async insertBusiness(
    business : UserBusiness,
    devices : UserDevice[],
    date : DateRangeDto
  ) {
    if(!business.baemin_login) {
      // 계정 상태 확인
      if(business.baemin_id !== null && business.baemin_password !== null) {
        let check = await this.checkBaemin(business.baemin_id , business.baemin_password);
        await timeout();
        if(!check['errYn']) {
          check = await this.checkBaemin(business.baemin_id , business.baemin_password);
        }
        const text = String(check['errMsg']).split(' ')[2]
        if(check['errYn'] === 'Y' && text === '비밀번호입니다.') {
          await this.userPvd.changedBusiness(
            business,
            {
              baemin_password : null,
            }
          )
          //fcm
          const titleBody = FcmType.MESSAGE_TYPE[FcmType.CHANGED_PASSWORD]('배달의민족');
          const alertVO = new CreateAlertVO(
            titleBody.title,
            titleBody.body,
            business.id,
            Number(FcmType.CHANGED_PASSWORD),
            false
          )
          await this.alertPvd.createAlert(business ,alertVO)
          devices.forEach((device) => {
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
          return;
        }
        await this.userPvd.changedBusiness(
          business,
          {
            baemin_login : true
          }
        )
        await this.baeminSalesData(business ,date);
        await timeout(SET_TIME);
        await this.baeminDepositData(business , date);
        await this.userPvd.changedBusiness(
          business,
          {
            baemin_login : false,
            baemin_recented_at : new Date(new Date().setHours(new Date().getHours() + 9))
          }
        )
      }
    }
  }


  private async checkBaemin(
    id : string,
    password : string,
  ) : Promise<AxiosResponse<any> | number> {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    try {
      
      return await http.post(
        Endpoint.BAEMIN_SHOP_INFO,
        {
          userId : id,
          userPw : await decrypt(password),
        }
      )
    } catch(e) {
      return await http.post(
        Endpoint.BAEMIN_SHOP_INFO,
        {
          userId : id,
          userPw : await decrypt(password),
        }
      )
    }
  }

  private async baeminSalesData(
    business : UserBusiness,
    date : DateRangeDto
  ) : Promise<void> {
    try {
      let data = await this.baeminSales(
        business.baemin_id,
        business.baemin_password,
        date.start_date,
        date.end_date
      );
      if(data['errYn'] === "" || data['errYn'] === "Y") {
        // "" = ID , PW가 맞지 않을 떄 리턴
        await this.userPvd.changedBusiness(
          business , 
          {
            baemin_login : false
          }
        )
        return;
      }
      const list = data['data']['touchOrderList'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          //(수정) Refactorin
          this.deliveryPvd.baeminUpsert(business,data);
        })
        await this.userPvd.changedBusiness(
          business , 
          {
            baemin_login : false
          }
        )
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          baemin_login : false
        }
      )
    }
  }

  private async baeminSales(
    baemin_id : string,
    baemin_password : string,
    startDate : string,
    endDate : string,
    process_YN : string | null = "N",
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );

    let baemins = await http.post(
      Endpoint.BAEMIN_SALES,
      {
        userId: baemin_id,
        userPw: await decrypt(baemin_password),
        dateFrom: startDate,
        dateTo: endDate,
        detailYn: "Y",
        detailListYn: "N",
        processYn: process_YN
      }
    );
    try {
      const baeminList = baemins['touchOrderList'] as Array<Object>;
      if(!baeminList) {
        baemins = await http.post(
          Endpoint.BAEMIN_SALES,
          {
            userId: baemin_id,
            userPw: await decrypt(baemin_password),
            dateFrom: startDate,
            dateTo: endDate,
            processYn: process_YN
          }
        );
      }
      return baemins;
    } catch(e) {
      return await http.post(
        Endpoint.BAEMIN_SALES,
        {
          userId: baemin_id,
          userPw: baemin_password!,
          dateFrom: startDate,
          dateTo: endDate,
          processYn: process_YN
        }
      );
    }
    
  }

  private async baeminDeposit(
    baemin_id : string,
    baemin_password : string,
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
    let baemins = await http.post(
      Endpoint.BAEMIN_DEPOSIT,
      {
        userId: baemin_id,
        userPw: await decrypt(baemin_password),
        dateFrom: startDate,
        dateTo: endDate,
      }
    );
    try {
      const baeminList = baemins['data']['calList'] as Array<Object>;

      if(!baeminList) {
        baemins = await http.post(
          Endpoint.BAEMIN_DEPOSIT,
          {
            userId: baemin_id,
            userPw: await decrypt(baemin_password),
            dateFrom: startDate,
            dateTo: endDate,
          }
        );
      }
    return baemins;
    } catch(e) {
      return await http.post(
        Endpoint.BAEMIN_DEPOSIT,
        {
          userId: baemin_id,
          userPw: await decrypt(baemin_password),
          dateFrom: startDate,
          dateTo: endDate,
        }
      );
    }
    
  }
  
  private async baeminDepositData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.baeminDeposit(
        business.baemin_id,
        business.baemin_password,
        date.start_date,
        date.end_date
      );
      
      if(data['common']['errYn'] === "" || data['common']['errYn'] === "Y") {
        // "" = ID , PW가 맞지 않을 떄 리턴
        await this.userPvd.changedBusiness(
          business , 
          {
            baemin_login : false
          }
        )
        return;
      }
      const list = data['data']['calList'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          //(수정) Refactorin
          this.deliveryDepositPvd.baeminUpsert(business,data);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          baemin_login : false
        }
      )
    }
  }
}