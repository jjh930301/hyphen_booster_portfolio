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
import { DateRangeDto } from "src/modules/home/dto/date.range.dto";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { CreateAlertVO } from "src/modules/user/vo/create.alert.vo";
import { decrypt } from "src/utils/crypto";
import { datetimeNow, parseDate } from "src/utils/date";
import { FirebaseCloudMessage } from "src/utils/firebase.cloud.message";
import { SET_DAY, SET_TIME , timeout} from "src/utils/timeout";

@Injectable()
export class HometaxCertService {
  private readonly logger = new Logger('hometax cert scheduler')

  constructor(
    private readonly userPvd : UserProvider,
    private readonly hometaxPvd : HometaxProvider,
    private readonly alertPvd : AlertProvider
  ){}

  @Cron(CronTime.hometax_cert , {
    name : 'hometax_cert',
    timeZone : 'Asia/Seoul'
  })
  async upsertHometax() {
    if(Constants.RUNNABLE) {
      const users = await this.userPvd.findJoinBizAll(SelectHelper.user_hometax_cert_select , 'cert')

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
    if(user) {
      user.businesses.forEach(async business => {
        if(business){
          this.insertBusiness(business , user.devices , date)
        }
      })
    }
  }
  private async insertBusiness(
    business : UserBusiness,
    devices : UserDevice[],
    date : DateRangeDto
  ) {
    if(business.hometax_login) return
    if(!business.cert || !business.cert_password || !business.pri) return
    const cert = await decrypt(business.cert)
    const pri = await decrypt(business.pri)
    const pw = await decrypt(business.cert_password)
    let check = await this.checkHometax(
      'CERT' ,
      cert , 
      pri,
      pw
    );
    if(check['error']) {
      check = await this.checkHometax(
        'CERT' ,
        cert , 
        pri,
        pw
      );
    }
    if(!check['out']) {
      check = await this.checkHometax(
        'CERT' ,
        cert , 
        pri,
        pw
      );
    }
    if(!check['out']['errYn']) {
      check = await this.checkHometax(
        'CERT' ,
        cert , 
        pri,
        pw
      );
    }
    
    // 데이터마켓에 만료된 인증서
    if(check['out']['errYn'] === 'Y') {
      // (수정) 비밀번호 null
      await this.userPvd.changedBusiness(
        business,
        {
          cert : null,
          pri : null,
          cert_password : null,
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
    await this.insertHometaxCashSales(business , cert , pri , pw , date);
    await timeout(SET_TIME);
    await this.insertHometaxCashPurchase(business , cert , pri , pw , date);
    await timeout(SET_TIME);
    await this.insertHometaxTaxSales(business , cert , pri , pw , date);
    await timeout(SET_TIME);
    await this.insertHometaxTaxPurchase(business , cert , pri , pw , date);
    //upsert 이후 로그인 해제
    await this.userPvd.changedBusiness(
      business , 
      {
        hometax_login : false,
        hometax_recented_at : new Date(new Date().setHours(new Date().getHours() + 9))
      }
    )
  }

  private async checkHometax(
    type : string , 
    cert : string ,
    pri : string,
    pw : string,
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
      return await http.post(
        Endpoint.HOMETAX_USER_INFO,
        {
          loginMethod : type,
          signCert : cert,
          signPri : pri,
          signPw : pw,
        }
      )
    } catch(e) {
      return await http.post(
        Endpoint.HOMETAX_USER_INFO,
        {
          loginMethod : type,
          signCert : cert,
          signPri : pri,
          signPw : pw,
        }
      )
    }
  }

  private async hometaxCashSales(
    cert : string,
    pri : string,
    pw : string,
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
          loginMethod : 'CERT',
          signCert : cert,
          signPri : pri,
          signPw : pw,
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
          loginMethod : 'CERT',
          signCert : cert,
          signPri : pri,
          signPw : pw,
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
    cert : string,
    pri : string,
    pw : string,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxCashSales(
        cert,
        pri,
        pw,
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        let data = await this.hometaxCashSales(
          cert,
          pri,
          pw,
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
    cert : string,
    pri : string,
    pw : string,
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
          loginMethod : 'CERT',
          signCert : cert,
          signPri : pri,
          signPw : pw,
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
          loginMethod : 'CERT',
          signCert : cert,
          signPri : pri,
          signPw : pw,
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
    cert : string,
    pri : string,
    pw : string,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxCashPurchase(
        cert,
        pri,
        pw,
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        data = await this.hometaxCashPurchase(
          cert,
          pri,
          pw,
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
    cert : string,
    pri : string,
    pw : string,
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
          loginMethod : 'CERT',
          signCert : cert,
          signPri : pri,
          signPw : pw,
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
          loginMethod : 'CERT',
          signCert : cert,
          signPri : pri,
          signPw : pw,
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
    cert : string,
    pri : string,
    pw : string,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxTaxSalse(
        cert,
        pri,
        pw,
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        data = await this.hometaxTaxSalse(
          cert,
          pri,
          pw,
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
    cert : string,
    pri : string,
    pw : string,
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
          loginMethod : 'CERT',
          signCert : cert,
          signPri : pri,
          signPw : pw,
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
          loginMethod : 'CERT',
          signCert : cert,
          signPri : pri,
          signPw : pw,
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
    cert : string,
    pri : string,
    pw : string,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxTaxPurchase(
        cert,
        pri,
        pw,
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        data = await this.hometaxTaxPurchase(
          cert,
          pri,
          pw,
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