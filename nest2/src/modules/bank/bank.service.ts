import { Injectable } from "@nestjs/common";
import { Constants } from "src/constants/constants";
import { Endpoint } from "src/constants/endpoint";
import { BankCode, BankCodeObj } from 'src/enums/bank.code';
import { Urls } from "src/constants/urls";
import { BusinessCert } from "src/entities/booster/user/business.cert.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { BankType } from "src/enums/bank.type";
import { ServiceData } from "src/models";
import { CustomHttp } from "src/models/custom.http";
import { decrypt, encrypt } from "src/utils/crypto";
import { dateNow, datetimeNow, insertLoopDateParser, parseDashDate, parseDate } from "src/utils/date";
import { UserProvider } from "../user/user.provider";
import { BankHistoryProvider } from "./bank.history.provider";
import { BankProvider } from "./bank.provider";
import { BankAccountDto } from "./dto/bank.accont.dto";
import { RegistBankDto } from "./dto/regist.bank.dto";
import { BusinessBank } from "src/entities/booster/user/business.bank.entity";
import { User } from "src/entities/booster/user/user.entity";
import { UserCert } from "src/entities/booster/user/user.cert.entity";
import { DeleteResult } from "typeorm";
import { DateRangeDto } from '../dto/date.rage.dto';
import { AccountListVO } from './vo/account.list.vo';
import { ConnectBankDto } from "./dto/connect.bank.dto";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { SchemaNames } from "src/constants/schema.names";
import { BankHistory } from "src/entities/booster/user/bank.history.entity";

@Injectable()
export class BankService {
  constructor(
    private readonly bankPvd : BankProvider,
    private readonly userPvd : UserProvider,
    private readonly bankHistoryPvd : BankHistoryProvider
  ){}

  private async bankAccounts(obj : Object) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    return await http.post(
      obj?.['type'] === BankType.corporation 
        ? Endpoint.CORPORATION_BANK_ACCOUNT_INFO 
        : Endpoint.PRIVATE_BANK_ACCOUNT_INFO,
      obj
    )
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

    return await http.post(
      obj?.['type'] === BankType.corporation 
        ? Endpoint.CORPORATION_BANK_HISTORY  
        : Endpoint.PRIVATE_BANK_HISTORY,
      obj
    )
  }
  
  private async insertBankHistoryData(
    business : UserBusiness,
    bank : BusinessBank,
    obj : Object
  ) {
    try {
      const data = await this.bankHistory(obj)
      let list = data['data']['list'] as unknown as Array<Object>
      if(list.length !== 0) {
        list.forEach(item => {
          this.bankHistoryPvd.upsert(business , bank , item)
        })
      }
    } catch(e) {
      await this.bankPvd.updateBankInfo({
        is_login : false
      } , 'id' , bank.id)
    }
  }

  private async insertBankHistory(
    bank : BusinessBank,
    business : UserBusiness , 
    obj : Object
  ) {
    try {
      let now = new Date(new Date().setMonth(new Date().getMonth() + 1));
      let createdAt = new Date(new Date().setMonth(business.created_at.getMonth()));
      let beforeTwoYears = new Date(new Date().setFullYear(createdAt.getFullYear()-2));
      for(let date = now ; beforeTwoYears <= date ; date.setMonth(date.getMonth()-1)) {
        const dateRange = insertLoopDateParser(date);
        obj['sdate'] = dateRange.start_date;
        obj['edate'] = dateRange.end_date;
        await this.insertBankHistoryData(business , bank , obj)
      }
      await this.bankPvd.updateBankInfo({
        is_login : false
      } , 'id' , bank.id)
    } catch(e) {
      console.log(e);
    }
  }

  public async accountList(
    user : User, 
    body : BankAccountDto
  ) : Promise<ServiceData> {
    try {
      const obj : Object = {
        type : body.type
      };
      if(body.acctNo) {
        obj['acctNo'] = body.acctNo
      }
      if(body.cert_num) {
        const cert = await this.userPvd.findOneCertByBzAndCertNum(user , body.cert_num)
        obj['signCert'] =  await decrypt(cert.cert)
        obj['signPri'] = await decrypt(cert.pri)
        obj['signPw'] = await decrypt(cert.cert_password)
        obj['gubun'] = '01';
        obj['bankCd'] = body.bankCd
        obj['loginMethod'] = 'CERT'
      } else {
        Object.keys(body).forEach((key) => {
          if(body[key]) {
            obj[key] = body[key] 
          }
        });
        if(body.bankCd === BankCode.WOORI) {
          obj['acctPw'] = body.acctPw
        }
        obj['gubun'] = '01'
        obj['loginMethod'] = 'ID';
      }
      
      const accounts = await this.bankAccounts(obj);
      // 데이터마켓 에러
      // if(accounts['common']['errYn'] === "Y")
      //   return ServiceData.ok(accounts['common']['errMsg'] , {accounts: null} , 2102)
      let accountList : Array<AccountListVO> = accounts?.['data']?.['list'] as unknown as Array<AccountListVO>
      if(accountList.length === 0 ) return ServiceData.ok(accounts['common']['errMsg'] , {accounts: null} , 2102)
      accountList = accountList.map(a => {
        return {
          acctNo : String(a.acctNo),
          acctNm : String(a.acctNm),
          acctTp : String(a.acctTp),
          openDt : String(a.openDt),
          endDt : String(a.endDt),
          balance : String(a.balance),
          curCd : String(a.curCd),
          ablBal : String(a.ablBal),
          acctHolder : String(a.acctHolder),
        }
      })
      return ServiceData.ok('Successfully getting accounts', {accounts : accountList} , 2101)
    } catch(e){
      return ServiceData.serverError(e);
    }
  }

  public async registAccount(
    user : User,
    business : UserBusiness,
    body : RegistBankDto
  ) : Promise<ServiceData> {
    try {
      const obj : Object = {
        detailYn : 'Y',
        sdate : null,
        edate : null,
        acctNo : body.account
      };
      const check = await this.bankPvd.findByBizAndKey(business , 'account' , body.account)
      if(check) return ServiceData.ok(`${BankCodeObj[check[0].bank_type]} ${check[0].account} 이미 등록된 계좌입니다.` , {result : false} , 2102)
      let cert : UserCert = null;
      if(body.cert_num) cert = await this.userPvd.findOneCertByBzAndCertNum(user , body.cert_num)
      if(cert) {
        body.cert = cert.cert,
        body.pri = cert.pri,
        body.cert_password = cert.cert_password
      }
      if(body.cert_num) {
        const cert = await this.userPvd.findOneCertByBzAndCertNum(user , body.cert_num)
        obj['signCert'] =  await decrypt(cert.cert) 
        obj['signPri'] = await decrypt(cert.pri)
        obj['signPw'] = await decrypt(cert.cert_password)
        obj['gubun'] = '01';
        obj['loginMethod'] = 'CERT'
      } else {
        obj['userId'] = body.bank_id;
        obj['userPw'] = body.bank_password;
        obj['gubun'] = '01'
        obj['loginMethod'] = 'ID';
        if(body.bank_type === BankCode.WOORI) {
          obj['acctPw'] = body.account_password
        }
      }
      obj['bankCd'] = body.bank_type;
      obj['type'] = body.type;
      body.type = body.type;
      
      const bank = await this.bankPvd.createBank(business , body);
      const bankEntity : BusinessBank = bank.generatedMaps[0] as unknown as BusinessBank
      if(!bankEntity.is_login) {
        await this.bankPvd.updateBankInfo({
          is_login : true,
          recent_at : dateNow
        } , 'id' , bankEntity.id)
        this.insertBankHistory(bankEntity , business , obj)
      }
      if(bank.generatedMaps) {
        return ServiceData.ok('Successfully create bank' , {result : true} , 2101)
      }
      return ServiceData.timeout();
    } catch(e) {
      console.log(e)
      return ServiceData.serverError(e);
    }
  }

  public async bankAccountList(business : UserBusiness) : Promise<ServiceData> {
    try {
      const banks = await this.bankPvd.findByBizAndKey(business)
      if(!banks) return ServiceData.ok('cannot found banks' , {banks:[]} ,2102)
      return ServiceData.ok('Successfully getting banks' , {banks} , 2101)
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  //Deprecated
  public async changedPaidAccount(
    business : UserBusiness,
    bankId : string,
  ) {
    try {
      await this.bankPvd.updateBankInfo({is_paid : 0} , 'business' ,business.id)
      const bank = await this.bankPvd.updateBankInfo({is_paid : 1} , 'id' ,bankId)
      if(bank.affected === 1)
      return ServiceData.ok('Successfully changed paid bank account' , {result : true} , 2101)
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async deleteAccount(bankId : string) : Promise<ServiceData> {
    try {
      const account : DeleteResult = await this.bankPvd.deleteAccount(bankId)
      if(account.affected === 1) return ServiceData.ok('Successfully delete bank account' , {result : true} , 2101)
      return ServiceData.noModelFound(bankId)
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async connectAccount(
    user : User,
    business : UserBusiness,
    data : ConnectBankDto
  ) : Promise<ServiceData> {
    try {
      let cert : UserCert = null;
      const bank : BusinessBank = await this.bankPvd.findById(data.bank_uuid);
      const obj : Object = {
        detailYn : 'Y',
        sdate : null,
        edate : null,
        acctNo : bank.account
      };
      if(data.cert_num) {
        cert = await this.userPvd.findOneCertByBzAndCertNum(user , data.cert_num)
        obj['signCert'] =  await decrypt(cert.cert) 
        obj['signPri'] = await decrypt(cert.pri)
        obj['signPw'] = await decrypt(cert.cert_password)
        obj['gubun'] = '01';
        obj['loginMethod'] = 'CERT'
      } else {
        obj['userId'] = data.bank_id;
        obj['userPw'] = data.bank_password;
        obj['gubun'] = '01'
        obj['loginMethod'] = 'ID';
        if(bank.bank_type === BankCode.WOORI) {
          obj['acctPw'] = data.account_password
        }
      }
      obj['bankCd'] = bank.bank_type;
      obj['type'] = bank.type;
      obj['sdate'] = parseDate(dateNow)
      obj['edate'] = parseDate(dateNow)
      const history = await this.bankHistory(obj)
      if(history['common']['errYn'] === 'Y') {
        return ServiceData.ok(history?.['common']?.['errMsg'] , {result : false} , 4000)
      }
      await this.bankPvd.updateBankInfo({
        cert : cert.cert ? cert.cert : null,
        pri: cert.pri ? cert.pri : null,
        cert_password: cert.cert_password ? cert.cert_password : null,
        cert_number : cert.cert_number ? cert.cert_number : null,
        bank_id : data.bank_id ? await encrypt(data.bank_id) : null,
        bank_password : data.bank_password ? await encrypt(data.bank_password) : null,
        account_password : data.account_password ? await encrypt(data.account_password) : null,
        recent_at : dateNow,
        connected_at : dateNow,
      } , 'id' , data.bank_uuid)
      // 요청전문(inJsonList) 내역중 이미 수집중인 계정정보가 있을경우 발생합니다.
      this.insertBankHistory(bank , business , obj)
      return ServiceData.ok('Successfully connected bank' , {result : true} , 2101);
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async balance(
    businessId : string
  ) : Promise<ServiceData> {
    try {
      const banks = await this.bankPvd.findByBiz(businessId)
      const balances = await Promise.all(banks.map(async bank => {
        const recent = await this.bankHistoryPvd.findOneByBank(bank.id);
        if(recent) {
          return recent
        }
      })).then(result => result)
      return ServiceData.ok('Successfully getting balance' , {balances} , 2101)
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }
  public async hyphenBankCalendar(
    business : UserBusiness,
    bankId : string,
    date : DateRangeDto
  ) {
    try {
      const banks: Array<BusinessBank> = await this.bankPvd.findByBiz(
        business.id,
        bankId ? 'id' : null,
        bankId ? bankId : null
      );
      for(let i = 0; i < banks.length; i += 1) {
        const obj : Object = {
          detailYn : 'Y',
          sdate : date.start_date,
          edate : date.end_date,
          acctNo : banks[i].account
        };
        // cert
        if(banks[i].cert) {
          obj['signCert'] =  await decrypt(banks[i].cert) 
          obj['signPri'] = await decrypt(banks[i].pri)
          obj['signPw'] = await decrypt(banks[i].cert_password)
          obj['gubun'] = '01';
          obj['loginMethod'] = 'CERT'
        // id / pw
        } else if(banks[i].bank_id) {
          obj['userId'] = banks[i].bank_id;
          obj['userPw'] = await decrypt(banks[i].bank_password);
          obj['gubun'] = '01'
          obj['loginMethod'] = 'ID';
          if(banks[i].bank_type === BankCode.WOORI) {
            obj['acctPw'] = banks[i].account_password
          }
        }
        obj['bankCd'] = banks[i].bank_type;
        obj['type'] = banks[i].type;
        if(banks[i].cert || banks[i].bank_id ) {
          await this.insertBankHistoryData(business, banks[i] , obj);
          await this.bankPvd.updateBankInfo({
            recent_at : dateNow
          } , "id" , banks[i].id)
        }
      }
      
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      let obj : Object = {};
      const start = new Date(parseDashDate(date.start_date));
      const end = new Date(parseDashDate(date.end_date));
      // new Arrayobj
      for(start ; start <= end ; start.setDate(start.getDate() + 1)) {
        obj[parseDate(start)] = {
          inAmt : 0,
          outAmt : 0
        };
      }
      const histories : Array<BankHistory> = await this.bankHistoryPvd.historyCalendar(
        business ,
        startDate,
        `${endDate} 23:59:59`,
      )
      histories.forEach(history => {
        obj[history['trDt']] = {
          inAmt : Number(history['inAmt']),
          outAmt : Number(history['outAmt'])
        }
      })
      if(histories) return ServiceData.ok(
        'Successfully getting account history' , 
        {
          calendar : obj
        },
        2101
      )
      return ServiceData.timeout();
    } catch(e) {
      console.log(e)
      return ServiceData.serverError(e);
    }
  }

  public async bankCalendar(
    business : UserBusiness,
    date : DateRangeDto
  ) {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      let obj : Object = {};
      const start = new Date(parseDashDate(date.start_date));
      const end = new Date(parseDashDate(date.end_date));
      // new Arrayobj
      for(start ; start <= end ; start.setDate(start.getDate() + 1)) {
        obj[parseDate(start)] = {
          inAmt : 0,
          outAmt : 0
        };
      }
      const histories : Array<BankHistory> = await this.bankHistoryPvd.historyCalendar(
        business ,
        startDate,
        `${endDate} 23:59:59`,
      )

      histories.forEach(history => {
        obj[history['trDt']] = {
          inAmt : Number(history['inAmt']),
          outAmt : Number(history['outAmt'])
        }
      })
      if(histories) return ServiceData.ok(
        'Successfully getting account history' , 
        {
          calendar : obj
        },
        2101
      )
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError(e)
    }
  }

  public async hyphenBankHistory(
    business : UserBusiness,
    bankId : string,
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      const banks: Array<BusinessBank> = await this.bankPvd.findByBiz(
        business.id,
        bankId ? 'id' : null,
        bankId ? bankId : null
      );
      for(let i = 0; i < banks.length; i += 1) {
        const obj : Object = {
          detailYn : 'Y',
          sdate : date.start_date,
          edate : date.end_date,
          acctNo : banks[i].account
        };
        // cert
        if(banks[i].cert) {
          obj['signCert'] =  await decrypt(banks[i].cert) 
          obj['signPri'] = await decrypt(banks[i].pri)
          obj['signPw'] = await decrypt(banks[i].cert_password)
          obj['gubun'] = '01';
          obj['loginMethod'] = 'CERT'
        // id / pw
        } else if(banks[i].bank_id) {
          obj['userId'] = banks[i].bank_id;
          obj['userPw'] = await decrypt(banks[i].bank_password);
          obj['gubun'] = '01'
          obj['loginMethod'] = 'ID';
          if(banks[i].bank_type === BankCode.WOORI) {
            obj['acctPw'] = banks[i].account_password
          }
        }
        obj['bankCd'] = banks[i].bank_type;
        obj['type'] = banks[i].type;
  
        if(banks[i].cert || banks[i].bank_id ) {
          await this.insertBankHistoryData(business, banks[i] , obj);
          await this.bankPvd.updateBankInfo({
            recent_at : dateNow
          } , "id" , banks[i].id)
        }
      }
      
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const histories = await this.bankHistoryPvd.findByBiz(
        business.id,
        startDate,
        `${endDate} 23:59:59`,
        bankId ? 'bank' : null,
        bankId ? bankId : null
      )
      if(histories) return ServiceData.ok(
        'Successfully getting history',
        {histories},
        2101
      )
      return ServiceData.timeout()
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async history(
    business : UserBusiness,
    bankId : string,
    date : DateRangeDto
  ) {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const histories = await this.bankHistoryPvd.findByBiz(
        business.id,
        startDate,
        `${endDate} 23:59:59`,
        bankId ? 'bank' : null,
        bankId ? bankId : null
      )
      if(histories) return ServiceData.ok(
        'Successfully getting history',
        {histories},
        2101
      )
      return ServiceData.timeout()
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }
}