import { Injectable } from '@nestjs/common';
import { Constants } from 'src/constants/constants';
import { Endpoint } from 'src/constants/endpoint';
import { Urls } from 'src/constants/urls';
import { BusinessBank } from 'src/entities/booster/user/business.bank.entity';
import { ServiceData } from 'src/models';
import { CustomHttp } from 'src/models/custom.http';
import { DateRangeDto } from '../dto/date.rage.dto';
import { UserProvider } from '../user/user.provider';
import { BankProvider } from './bank.provider';
import { BankCode } from 'src/enums/bank.code';
import { decrypt } from 'src/utils/crypto';
import { BankHistoryProvider } from './bank.history.provider';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';

@Injectable()
export class BankService {
  constructor(
    private readonly bankPvd : BankProvider,
    private readonly userPvd : UserProvider,
    private readonly bankHistoryPvd : BankHistoryProvider
  ){}

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
      Endpoint.PRIVATE_BANK_HISTORY,
      obj
    )
  }

  public async history(
    businessId : string,
    query : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      const bank = await this.bankPvd.findByBizAndKey(businessId , 'is_paid' , 1) as BusinessBank;
      if(!bank) return ServiceData.ok(`${businessId} is no registerd paid account` , null , 4002)
      if(bank.bank_type !== BankCode.KYUNGNAM) return ServiceData.ok('registerd paid account is not kyungnam bank' , null , 2003)
      const obj : Object = {
        sdate : query.start_date,
        edate : query.end_date
      };
      if(bank.cert_number) {
        obj['signCert'] =  await decrypt(bank.cert)
        obj['signPri'] = await decrypt(bank.pri)
        obj['signPw'] = await decrypt(bank.cert_password)
        obj['gubun'] = '01';
        obj['bankCd'] = bank.bank_type
        obj['acctNo'] = bank.account;
        obj['loginMethod'] = 'CERT'
      } else {
        obj['userId'] = bank.bank_id;
        obj['userPw'] = await decrypt(bank.bank_password);
        obj['acctNo'] = bank.account;
        // 다른 은행이 선정산 계좌로 될 떄 우리은행은 비밀번호 계좌 비밀번호 추가
        // if(bank.bank_type === BankCode.WOORI) {
        //   obj['acctPw'] = await decrypt(bank.account_password)
        // }
        obj['gubun'] = '01';
        obj['loginMethod'] = 'ID';
      }
      const data = await this.bankHistory(obj);
      // 데이터 최신화
      let history = data['data']['list'] as unknown as Array<Object>
      const business = await this.userPvd.findByBzId(businessId);
      if(history?.length !== 0) {
        history.forEach(item => {
          this.bankHistoryPvd.upsert(business , bank , item)
        })
      }
      if(data?.['common']?.['errYn'] === 'Y') {
        return ServiceData.httpError(data?.['common']?.['errMsg'] , null)
      }
      return ServiceData.ok(`Successfully getting ${bank.id} histories` , history , 2001);
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }
}
