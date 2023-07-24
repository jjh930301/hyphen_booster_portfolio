import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Constants } from "src/constants/constants";
import { CronTime } from "src/constants/cron";
import { Endpoint } from "src/constants/endpoint";
import { Urls } from "src/constants/urls";
import { BusinessBank } from "src/entities/booster/user/business.bank.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { BankCode } from "src/enums/bank.code";
import { CustomHttp } from "src/models/custom.http";
import { DateRangeDto } from "src/modules/home/dto/date.range.dto";
import { UserProvider } from "src/modules/user/user.provider";
import { decrypt } from "src/utils/crypto";
import { dateNow, datetimeNow, parseDate } from "src/utils/date";
import { SET_DAY, timeout } from "src/utils/timeout";
import { BankHistoryProvider } from "./bank.history.provider";
import { BankProvider } from "./bank.provider";

@Injectable()
export class BankService {

  private readonly logger = new Logger('Bank scheduler');

  constructor(
    private readonly bankHistoryPvd : BankHistoryProvider,
    private readonly bankPvd : BankProvider,
    private readonly userPvd : UserProvider,
  ){}

  @Cron(CronTime.bank , {
    name : 'private_bank',
    timeZone : 'Asia/Seoul'
  })
  async privateBank() {
    if(true) {
    // if(Constants.RUNNABLE) {
      const users = await this.userPvd.findAllJoinBank()
      users.forEach(user => {
        user.businesses.forEach(business => {
          this.businessBank(business , user.devices);
        })
      })
      this.logger.log('bank update' , datetimeNow());
    }
  }

  async businessBank(
    business : UserBusiness,
    devices : UserDevice[]
  ) {
    try {
      for(let i = 0 ; i < business.banks.length ; i++) {
        await this.insertBankHistory(business , business.banks[i] , devices)
      }
    } catch(e) {
      console.log(e)
    }
  }

  private async bankHistory(obj : Object) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    const data = await http.post(
      Endpoint.PRIVATE_BANK_HISTORY,
      obj
    )
    let errMsg = String(data['common']['errMsg']).includes('inJsonList')
    // 이미 수집중인 경우 재귀호출
    if(errMsg) {
      await timeout(60 * 1000 * 5)
      return await this.bankHistory(obj);
    }
    return data
  }

  private async insertBankHistory(
    business : UserBusiness,
    bank : BusinessBank,
    devices : Array<UserDevice>
  ) {
    
    const obj : Object = {
      detailYn : 'Y',
      gubun : '01',
      bankCd : null,
      loginMethod : null,
      acctNo : null,
      sdate : null,
      edate : null,
    }
    try {
      if(bank.cert || bank.bank_id) {
        await this.bankPvd.updateBankInfo({
          is_login : true
        } , 'id' , bank.id)
        // logic
        const now = new Date(new Date().setTime(new Date().getTime() + 9));
        obj['sdate'] = parseDate(new Date(new Date().setDate(now.getDate() - SET_DAY)));
        obj['edate'] = parseDate(now);
        obj['bankCd'] = bank.bank_type
        obj['acctNo'] = bank.account
        if(bank.cert) {
          obj['signCert'] =  await decrypt(bank.cert)
          obj['signPri'] = await decrypt(bank.pri)
          obj['signPw'] = await decrypt(bank.cert_password)
          obj['loginMethod'] = 'CERT'
        } else {
          obj['userId'] = bank.bank_id;
          obj['userPw'] = await decrypt(bank.bank_password);
          obj['gubun'] = '01'
          obj['loginMethod'] = 'ID';
          if(bank.bank_type === BankCode.WOORI) {
            obj['acctPw'] = bank.account_password
          }
        }
        const flag : number = await this.insertBankHistoryData(business , bank , obj);
        if (flag === 2 || flag === 3) {
          // fcm message
        }
  
        await this.bankPvd.updateBankInfo({
          is_login : false,
          recent_at : dateNow
        } , 'id' , bank.id)
      }
    } catch(e) {
      console.log(e)
      await this.bankPvd.updateBankInfo({
        is_login : false
      } , 'id' , bank.id)
    }
  }

  private async insertBankHistoryData(
    business : UserBusiness,
    bank : BusinessBank,
    obj : Object
  ) : Promise<number> {
    try {
      const data = await this.bankHistory(obj)
      const text = data?.['common']?.['errMsg'] ? String(data?.['common']?.['errMsg']).split(' ')[1] : null;
      // error message가 존재할 때
      if(text) {
        if(text === '인증서') {
          return 2
        }
        if(text === '비밀번호가') {
          return 3
        }
      }
      let list = data['data']['list'] as unknown as Array<Object>
      if(list.length !== 0) {
        list.forEach(item => {
          this.bankHistoryPvd.upsert(business , bank , item)
        })
      }
      return 1
    } catch(e) {
      console.log(e)
      await this.bankPvd.updateBankInfo({
        is_login : false
      } , 'id' , bank.id)
    }
  }
}