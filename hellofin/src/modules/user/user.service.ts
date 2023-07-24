import { Injectable } from '@nestjs/common';
import { Constants } from 'src/constants/constants';
import { Endpoint } from 'src/constants/endpoint';
import { Urls } from 'src/constants/urls';
import { BusinessBank } from 'src/entities/booster/user/business.bank.entity';
import { BankCode } from 'src/enums/bank.code';
import { OnedayServiceStatus } from 'src/enums/oneday.service.status';
import { UserPaid } from 'src/enums/user/user.paid';
import { ServiceData } from 'src/models';
import { CustomHttp } from 'src/models/custom.http';
import { DataSource, QueryRunner } from 'typeorm';
import { BankProvider } from '../bank/bank.provider';
import { CrefiaService } from '../crefia/crefia.service';
import { BaeminService } from '../delivery/baemin.service';
import { YogiyoService } from '../delivery/yogiyo.service';
import { OnedayResultDto } from './dto/oneday.result.dto';
import { UserProvider } from './user.provider';

@Injectable()
export class UserService {
  constructor(
    private readonly datasource : DataSource,
    private readonly bankPvd : BankProvider,
    private readonly userPvd : UserProvider,
    private readonly yogiyoSvc : YogiyoService,
    private readonly baeminSvc : BaeminService,
    private readonly crefiaSvc : CrefiaService
  ){}

  public async paidResult(
    body : OnedayResultDto
  ) : Promise<ServiceData>{
    const business = await this.userPvd.findByBzId(body.business_uuid);
    if(!business) return ServiceData.noModelFound('business')
    const http = new CustomHttp(Urls.MNWISE , {
      Authorization : Constants.MNWISE_KEY,
      Accept : 'application/json; charset=utf-8',
      'Content-Type' : 'application/json; charset=utf-8',
    })

    if(body.status === OnedayServiceStatus.rejection || body.status === UserPaid.termination) {
      await this.userPvd.changedBusiness(business , {
        is_paid : body.status
      })
      // NOTE: 알림톡
      return ServiceData.ok('Cannot create bank accounts' , {result : false} , 2001)
    }

    const queryRunner : QueryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 배민 여신 요기요 비동기 업데이트 
      if(body.credit_id) {
        this.crefiaSvc.crefia(business , body.credit_id , body.credit_password)
      }
      if(body.yogiyo_id) {
        this.yogiyoSvc.yogiyo(business , body.yogiyo_id , body.yogiyo_password)
      }
      if(body.baemin_id) {
        this.baeminSvc.baemin(business , body.baemin_id , body.baemin_password)
      }
      
      let kyungnamAccount : BusinessBank = await this.bankPvd.findByBizAndKey(body.business_uuid , 'account' , body?.kyungnam_account) as BusinessBank; 
      if(kyungnamAccount === undefined && body.kyungnam_account && body.kyungnam_account_type) {
        const kAccount = await this.bankPvd.createBank({
          account : body.kyungnam_account,
          account_name : '경남은행 정산 계좌',
          bank_type : BankCode.KYUNGNAM,
          type : body.kyungnam_account_type,
          business,
          contracted_at : body.contracted_at,
          is_paid : 1,
          paid_started_at : body.withdrawaled_at ? body.withdrawaled_at : null,
          status : OnedayServiceStatus.settlement,
          sales_person_id : body.sales_person_id,
          sales_person_mobile : body.sales_person_mobile,
        } , queryRunner)
        if(kAccount) {
          kyungnamAccount = kAccount.generatedMaps[0] as unknown as BusinessBank
        }
      }
      let paidAccount : BusinessBank = await this.bankPvd.findByBizAndKey(body.business_uuid , 'account' , body?.paid_account) as BusinessBank; 
      if(paidAccount === undefined && body.paid_account && body.paid_account_bank_type && body.paid_account_type) {
        const pAccount = await this.bankPvd.createBank({
          account : body.paid_account,
          account_name : '선정산 입금 계좌',
          bank_type : body.paid_account_bank_type,
          type : body.paid_account_type,
          business,
          contracted_at : body.contracted_at,
          is_paid : 1,
          paid_started_at : body.withdrawaled_at ? body.withdrawaled_at : null,
          status : OnedayServiceStatus.payments,
          sales_person_id : body.sales_person_id,
          sales_person_mobile : body.sales_person_mobile,
        } , queryRunner)
        if(pAccount) {
          paidAccount = pAccount.generatedMaps[0] as unknown as BusinessBank
        }
      }
      await this.userPvd.changedBusiness(business , {
        is_paid : UserPaid.paid,
        h_id : body.ylsolution_id
      } , queryRunner)
      
      
      if(!kyungnamAccount) {
        throw ServiceData.invalidRequest('cannot create bank' , 4000 , 'result')
      }
      const user = await this.userPvd.findUserById(String(business.user));
      await http.post(Endpoint.KAKAO_ALERT , {
        SEQ : `${business.id}_${Date.now()}`,
        RECEIVER : user.mobile, //user.mobile
        JONMUN: {
          SENDER_KEY : Constants.SENDER_KEY,
          TMPL_CD : String(process.env.CODE_ONEDAY_SERVICE),
          SND_MSG : `${business.store_name} 사장님\n원데이서비스 심사가 완료되었어요!\n지급 계좌가 변경되는 카드사별로 선정산이 시작돼요. (평균 2~3일 소요)\n부스터에서 선정산 입금액을 확인하세요.`,
          MESSAGE_TYPE : "AI",
          ATTACHMENT : [
            {
              name: "입금내역 보러가기", 
              type : "WL", 
              url_mobile : "https://hyphenboostermobile.page.link/oneday_started", 
              url_pc : "https://mobile.booster.hyphen.im/oneday_started"
            }
          ]
        }
      })
      await queryRunner.commitTransaction();
      return ServiceData.ok('Successfully regist oneday service' , {result : true} , 2000)
    } catch(e) {
      await queryRunner.rollbackTransaction()
      return e
    } finally {
      await queryRunner.release();
    }
  }
}
