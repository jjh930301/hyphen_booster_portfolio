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
import { HometaxProvider } from "src/modules/booster/hometax.provider";
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
export class HometaxService {
  private readonly logger = new Logger('Hometax scheduler');

  constructor(
    private readonly userPvd : UserProvider,
    private readonly tokenPvd : TokenProvider,
    private readonly hometaxPvd : HometaxProvider,
    private readonly alertPvd : AlertProvider
  ){}

  @Cron(CronTime.hometax , {
    name : 'hometax',
    timeZone : 'Asia/Seoul'
  })
  async upsertHometax() {
    if(Constants.RUNNABLE) {
      const users = await this.userPvd.findJoinBizAll(SelectHelper.user_hometax_select , 'hometax_id');

      //local time
      const now = new Date(new Date().setTime(new Date().getTime() + 9));

      const commonRange = new DateRangeDto();
      commonRange.start_date = parseDate(new Date(new Date().setDate(now.getDate() - SET_DAY)));
      commonRange.end_date = parseDate(now);
      users.forEach(user => {
        this.insertUser(user , commonRange);
      });
      this.logger.log('hometax update' , datetimeNow());
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
    //login 상태가 아닐 때에만 받아옴
    if(!business.hometax_login) {
      //login 상태가 아닐 때 로그인 상태로 변경
      if(business.hometax_id !== null && business.hometax_password !== null) {
        let check = await this.checkHometax(
          'ID' ,
          business.hometax_id , 
          business.hometax_password);
        await timeout();
        if(check['error']) {
          check = await this.checkHometax(
            'ID' ,
            business.hometax_id , 
            business.hometax_password);
        }
        if(!check['out']) {
          check = await this.checkHometax(
            'ID' ,
            business.hometax_id , 
            business.hometax_password);
        }
        if(!check['out']['errYn']) {
          check = await this.checkHometax(
            'ID' ,
            business.hometax_id , 
            business.hometax_password);
        }
        let text = "";
        if(String(check['out']['errMsg'])) {
          text = String(check['out']['errMsg']).split(']')[2]
          if(text) {
            text = text.split(' ')[0]
          }
        }
        
        if(check['out']['errYn'] === 'Y' && text === '비밀번호가') {
          // (수정) 비밀번호 null
          await this.userPvd.changedBusiness(
            business,
            {
              hometax_password : null,
            }
          )
          //fcm
          const titleBody = FcmType.MESSAGE_TYPE[FcmType.CHANGED_PASSWORD]('홈택스');
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
          business , 
          {
            hometax_login : true
          }
        ) 
        await this.insertHometaxCashSales(business , date);
        await timeout(SET_TIME);
        await this.insertHometaxCashPurchase(business , date);
        await timeout(SET_TIME);
        await this.insertHometaxTaxSales(business , date);
        await timeout(SET_TIME);
        await this.insertHometaxTaxPurchase(business , date);
        //upsert 이후 로그인 해제
        await this.userPvd.changedBusiness(
          business , 
          {
            hometax_login : false,
            hometax_recented_at : new Date(new Date().setHours(new Date().getHours() + 9))
          }
        )
      }
    }
  }

  private async checkHometax(
    type : string , 
    id : string ,
    password : string) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    try {
      return await http.post(
        Endpoint.HOMETAX_USER_INFO,
        {
          loginMethod : type,
          userId : id,
          userPw : await decrypt(password)
        }
      )
    } catch(e) {
      return await http.post(
        Endpoint.HOMETAX_USER_INFO,
        {
          loginMethod : type,
          userId : id,
          userPw : await decrypt(password)
        }
      )
    }
  }

  private async hometaxCashSales(
    hometaxId : string,
    hometaxPassword : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    try {
      let cashSales = await http.post(
        Endpoint.HOMETAX_SALES_CASH,
        {
          userId : hometaxId,
          userPw : await decrypt(hometaxPassword),
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
      return cashSales;
    } catch(e) {
      return await http.post(
        Endpoint.HOMETAX_SALES_CASH,
        {
          userId : hometaxId,
          userPw : await decrypt(hometaxPassword),
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
    }
    //check under line
  }

  private async insertHometaxCashSales(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxCashSales(
        business.hometax_id,
        business.hometax_password,
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        data = await this.hometaxCashSales(
          business.hometax_id,
          business.hometax_password,
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxPvd.cashSalesUpsert(business , d);
        })
      }
    } catch(e) {
      console.log(e);
      await this.userPvd.changedBusiness(
        business , 
        {
          hometax_login : false
        }
      )
    }
  }

  private async hometaxCashPurchase(
    hometaxId : string,
    hometaxPassword : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    try {
      let cashPurchase = await http.post(
        Endpoint.HOMETAX_PURCHASE_CASH,
        {
          userId : hometaxId,
          userPw : await decrypt(hometaxPassword),
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
      return cashPurchase;
    } catch(e) {
      return await http.post(
        Endpoint.HOMETAX_PURCHASE_CASH,
        {
          userId : hometaxId,
          userPw : await decrypt(hometaxPassword),
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
    }
  }

  private async insertHometaxCashPurchase(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxCashPurchase(
        business.hometax_id,
        business.hometax_password,
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        data = await this.hometaxCashPurchase(
          business.hometax_id,
          business.hometax_password,
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxPvd.cashPurchaseUpsert(business , d);
        })
      }
    } catch(e) {
      console.log(e);
      await this.userPvd.changedBusiness(
        business , 
        {
          hometax_login : false
        }
      )
    }
  }

  private async hometaxTaxSalse(
    hometaxId : string,
    hometaxPassword : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    try {
      let cashPurchase = await http.post(
        Endpoint.HOMETAX_SALES_TAX,
        {
          userId : hometaxId,
          userPw : await decrypt(hometaxPassword),
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
      return cashPurchase;
    } catch(e) {
      return await http.post(
        Endpoint.HOMETAX_SALES_TAX,
        {
          userId : hometaxId,
          userPw : await decrypt(hometaxPassword),
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
    }
    
    //check under line
  }

  private async insertHometaxTaxSales(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxTaxSalse(
        business.hometax_id,
        business.hometax_password,
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        data = await this.hometaxTaxSalse(
          business.hometax_id,
          business.hometax_password,
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxPvd.taxUpsert(business , d);
        })
      }
    } catch(e) {
      console.log(e);
      await this.userPvd.changedBusiness(
        business , 
        {
          hometax_login : false
        }
      )
    }
  }

  private async hometaxTaxPurchase(
    hometaxId : string,
    hometaxPassword : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    try {
      let cashPurchase = await http.post(
        Endpoint.HOMETAX_PURCHASE_TAX,
        {
          userId : hometaxId,
          userPw : await decrypt(hometaxPassword),
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
      return cashPurchase;
    } catch(e) {
      
      return await http.post(
        Endpoint.HOMETAX_PURCHASE_TAX,
        {
          userId : hometaxId,
          userPw : await decrypt(hometaxPassword),
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
    }
    
    //check under line
  }

  private async insertHometaxTaxPurchase(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxTaxPurchase(
        business.hometax_id,
        business.hometax_password,
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        data = await this.hometaxTaxPurchase(
          business.hometax_id,
          business.hometax_password,
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxPvd.taxUpsert(business , d);
        })
      }
    } catch(e) {
      console.log(e);
      await this.userPvd.changedBusiness(
        business , 
        {
          hometax_login : false
        }
      )
    }
  }
}