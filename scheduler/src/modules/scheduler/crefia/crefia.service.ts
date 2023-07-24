import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { Constants } from "src/constants/constants";
import { CronTime } from "src/constants/cron";
import { Endpoint } from "src/constants/endpoint";
import { FcmType } from "src/constants/fcm.type";
import { Urls } from "src/constants/urls";
import { CrefiaPurchase } from "src/entities/booster/crefia/crefia.purchase.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { User } from "src/entities/booster/user/user.entity";
import { SelectHelper } from "src/helpers/select.helper";
import { CustomHttp } from "src/models/custom.http";
import { CrefiaCardProvider } from "src/modules/booster/crefia.card.provider";
import { CrefiaDepositProvider } from "src/modules/booster/crefia.deposit.provider";
import { CrefiaFeeProvider } from "src/modules/booster/crefia.fee.provider";
import { CrefiaPurchaseProvider } from "src/modules/booster/crefia.purchase.provider";
import { CrefiaUnPurchaseProvider } from "src/modules/booster/crefia.unpurchase.provider";
import { TokenProvider } from "src/modules/booster/token.provider";
import { DateRangeDto } from "src/modules/home/dto/date.range.dto";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { CreateAlertVO } from "src/modules/user/vo/create.alert.vo";
import { decrypt } from "src/utils/crypto";
import { datetimeNow, parseDashDate, parseDate } from "src/utils/date";
import { FirebaseCloudMessage } from "src/utils/firebase.cloud.message";
import { hyphenTokenRefresh } from "src/utils/hyphen.token.refresh";
import { SET_DAY, SET_TIME ,timeout} from "src/utils/timeout";

@Injectable()
export class CrefiaService {
  private readonly logger = new Logger('Crefia scheduler');

  constructor(
    private readonly userPvd : UserProvider,
    private readonly tokenPvd : TokenProvider,
    private readonly cardPvd : CrefiaCardProvider,
    private readonly purchasePvd : CrefiaPurchaseProvider,
    private readonly depositPvd : CrefiaDepositProvider,
    private readonly unPurchasePvd : CrefiaUnPurchaseProvider,
    private readonly feePvd : CrefiaFeeProvider,
    private readonly alertPvd : AlertProvider
  ){}
  @Cron(CronTime.crefia_comm , {
    name : 'crefia_comm',
    timeZone : 'Asia/Seoul'
  })
  async updateComm() {
    if(Constants.RUNNABLE) {
      const now = new Date(new Date().setTime(new Date().getTime() + 9));
      const date = parseDashDate(parseDate(new Date(new Date().setDate(now.getDate() - 10))));
      const purchases : CrefiaPurchase[] = await this.purchasePvd.findAll(date)
      Promise.all(purchases.map((purchase) => {
        this.cardPvd.updateComm(purchase);
      }))
    }
  }

  @Cron(CronTime.crefia , {
    name : 'crefia',
    timeZone : 'Asia/Seoul'
  })
  async upsertCrefiaData() {
    if(Constants.RUNNABLE) {
      
      const businesses : UserBusiness[] = await this.userPvd.ifHyphenFixed();

      const now = new Date(new Date().setTime(new Date().getTime() + 9));

      const commonRange = new DateRangeDto();
      commonRange.start_date = parseDate(new Date(new Date().setDate(now.getDate() - SET_DAY)));
      commonRange.end_date = parseDate(now);
      
      for(let i = 0 ; i < businesses.length ; i++) {
        await timeout(1000)
        this.insertBusiness(businesses[i] , null , commonRange);
      }
      //
      this.logger.log('crefia update' , datetimeNow());
    }
  }

  private insertUser(
    user : User,
    date : DateRangeDto
  ) {
    user.businesses.forEach(async business => {
      // FIXED : 데이터마켓 수정 완료시
      this.insertBusiness(business , user.devices, date);
    })
  }

  private async insertBusiness(
    business : UserBusiness,
    devices : UserDevice[],
    date : DateRangeDto
  ) {
    //login 상태가 아닐 때에만 받아옴
    if(!business.crefia_login) {
      //login 상태가 아닐 때 로그인 상태로 변경
      if(business.crefia_id !== null && business.crefia_password !== null) {
        
        let fees = await this.crefiaFeeRate(
          business.crefia_id,
          business.crefia_password,
          business.member_group_id
        );
        await timeout();
        if(!fees['common']) {
          await timeout();
          fees = await this.crefiaFeeRate(
            business.crefia_id,
            business.crefia_password,
            business.member_group_id
          );
        }
        const text = String(fees['common']['errMsg']).split(' ')[1]
        if(fees['common']['errYn'] === 'Y' && text === '비밀번호가') {
          
          await this.userPvd.changedBusiness(
            business,
            {
              crefia_password : null
            }
          )
          //fcm
          const titleBody = FcmType.MESSAGE_TYPE[FcmType.CHANGED_PASSWORD]('여신금융협회');
          const alertVO = new CreateAlertVO(
            titleBody.title,
            titleBody.body,
            business.id,
            Number(FcmType.CHANGED_PASSWORD),
            false
          )
          await this.alertPvd.createAlert(business ,alertVO)
          if(devices) {
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
          }
          return;
        }
        // 수수료율
        if(Array.isArray(fees['data']['list'])) {
          await this.userPvd.changedBusiness(
            business , 
            {
              crefia_login : true
            }
          )
          const rates = fees['data']['list'] as Array<Object>;
          rates.forEach(rate => {
            this.feePvd.insertFee(business,rate)
          })
          // insert crefia fee
          await timeout(SET_TIME);
          await this.insertCrefiaCard(business , date , rates);
          await timeout(SET_TIME);
          await this.insertCrefiaDeposit(business , date);
          await timeout(SET_TIME);
          await this.insertCrefiaPurchase(business , date);
          //upsert 이후 로그인 해제
          await this.userPvd.changedBusiness(
            business , 
            {
              crefia_login : false,
              crefia_recented_at : new Date(new Date().setHours(new Date().getHours() + 9))
            }
          )
        }
      }
    }
  } 

  private async crefiaFeeRate(
    crefia_id : string,
    crefia_password : string,
    groupId : string
  ) {
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
        Endpoint.CREFIA_FEE_RATE,
        {
          userId : crefia_id,
          userPw : await decrypt(crefia_password),
          memGrpId : groupId
        }
      )
    } catch(e) {
      await timeout();
      return await http.post(
        Endpoint.CREFIA_FEE_RATE,
        {
          userId : crefia_id,
          userPw : await decrypt(crefia_password),
          memGrpId : groupId
        }
      )
    }
    
  }

  private async crefiaCard(
    crefiaId : string,
    crefiaPw : string,
    memberGroupId : string,
    startDate : string,
    endDate : string,
    detailYN : string
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    try {
      let cards = await http.post(
        Endpoint.CREFIA_APPROVAL_CARD, // endpoint
        {
          userId: crefiaId,
          userPw: await decrypt(crefiaPw),
          memGrpId : memberGroupId,
          fromDate: startDate,
          toDate: endDate,
          detailYn: detailYN,
          unpchYn: 'N'
        }
      );
      const cardList = cards['out']['outB0011']['listDtl'] as Array<Object>;
      const check = cardList.filter(card => {
        return card['cardNum'] === null
      });
      //cardNum이 null이 존재 하면 재귀함수 호출
      if(0 < check.length) {
        await timeout();
        cards = await http.post(
          Endpoint.CREFIA_APPROVAL_CARD, // endpoint
          {
            userId: crefiaId,
            userPw: await decrypt(crefiaPw),
            memGrpId : memberGroupId,
            fromDate: startDate,
            toDate: endDate,
            detailYn: detailYN,
            unpchYn: 'N'
          }
        );
      }
      return cards;
    } catch(e) {
      await timeout();
      return await http.post(
        Endpoint.CREFIA_APPROVAL_CARD, // endpoint
        {
          userId: crefiaId,
          userPw: await decrypt(crefiaPw),
          memGrpId : memberGroupId,
          fromDate: startDate,
          toDate: endDate,
          detailYn: detailYN,
          unpchYn: 'N'
        }
      );
    }
    
  }
  private async insertCrefiaCard(
    business : UserBusiness,
    query : DateRangeDto,
    rates : Array<Object>
  ) : Promise<void> {
    try {
      let data = await this.crefiaCard(
        business.crefia_id,
        business.crefia_password,
        business.member_group_id,
        query.start_date,
        query.end_date,
        "Y"
      )
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.crefiaCard(
          business.crefia_id,
          business.crefia_password,
          business.member_group_id,
          query.start_date,
          query.end_date,
          "Y"
        )
      } 
      
      const list = data['out']['outB0011']['listDtl'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(async data => {
          await this.cardPvd.upsert(business , data , rates);
        })
        //insert 미매입
        list.forEach(async data => {
          const purchase = await this.purchasePvd.findOne(business , data);
          const cards = await this.cardPvd.findCancelOne(business , data);
          if(!purchase && cards.length !== 2) {
            await this.unPurchasePvd.upsert(business , data);
          }
        })
      }

    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          crefia_login : false
        }
      )
    }
  }

  private async crefiaPurchase(
    crefiaId : string,
    crefiaPw : string,
    memberGroupId : string,
    startDate : string,
    endDate : string,
    detailYN : string
  ) {
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
        Endpoint.CREFIA_PURCHASE_CARD,
        {
          userId: crefiaId,
          userPw: await decrypt(crefiaPw),
          memGrpId : memberGroupId,
          fromDate: startDate,
          toDate: endDate,
          detailYn: detailYN,
        }
      )
    } catch(e) {
      await timeout();
      return await http.post(
        Endpoint.CREFIA_PURCHASE_CARD,
        {
          userId: crefiaId,
          userPw: await decrypt(crefiaPw),
          memGrpId : memberGroupId,
          fromDate: startDate,
          toDate: endDate,
          detailYn: detailYN,
        }
      );
    }
  }

  private async insertCrefiaPurchase(
    business : UserBusiness,
    query : DateRangeDto
  ) {
    try {
      let data = await this.crefiaPurchase(
        business.crefia_id,
        business.crefia_password,
        business.member_group_id,
        query.start_date,
        query.end_date,
        "Y"
      )
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.crefiaPurchase(
          business.crefia_id,
          business.crefia_password,
          business.member_group_id,
          query.start_date,
          query.end_date,
          "Y"
        )
      } 
      
      const list = data['out']['outB0021']['listDtl'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(async data => {
          //해외 / 기타인 매입은 수수료 업데이트
          if(data['cardDiv'] === '해외' || data['cardDiv'] === '기타') {
            await this.cardPvd.updateCommission(data);
          }
          //call provider set data
          await this.purchasePvd.upsert(business , data);
          //입금 예정에 받아온 값들은 무조건 미매입에서 삭제
          await this.unPurchasePvd.softDelete(business , data)
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          crefia_login : false
        }
      )
    }
  }

  private async crefiaDeposit(
    crefiaId : string,
    crefiaPw : string,
    memberGroupId : string,
    startDate : string,
    endDate : string,
    detailYN : string
  ) {
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
        Endpoint.CREFIA_DEPOSIT_CARD,
        {
          userId: crefiaId,
          userPw: await decrypt(crefiaPw),
          memGrpId : memberGroupId,
          fromDate: startDate,
          toDate: endDate,
          detailYn: detailYN,
        }
      )
    } catch (e) {
      await timeout();
      return await http.post(
        Endpoint.CREFIA_DEPOSIT_CARD,
        {
          userId: crefiaId,
          userPw: await decrypt(crefiaPw),
          memGrpId : memberGroupId,
          fromDate: startDate,
          toDate: endDate,
          detailYn: detailYN,
        }
      )
    }
  }

  private async insertCrefiaDeposit(
    business : UserBusiness,
    query : DateRangeDto
  ) {
    try {
      let data = await this.crefiaDeposit(
        business.crefia_id,
        business.crefia_password,
        business.member_group_id,
        query.start_date,
        query.end_date,
        "Y"
      )
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.crefiaDeposit(
          business.crefia_id,
          business.crefia_password,
          business.member_group_id,
          query.start_date,
          query.end_date,
          "Y"
        )
      } 
      
      const list = data['out']['outB0031']['listDtl'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          //call provider set data
          this.depositPvd.insertDoNoting(business , data);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          crefia_login : false
        }
      )
    }
  }
}