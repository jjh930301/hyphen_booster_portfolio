import { Injectable } from "@nestjs/common";
import { Urls } from "src/constants/urls";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
import { SelectHelper } from "src/helpers/select/select.helper";
import { ServiceData } from "src/models";
import { CustomHttp } from "src/models/custom.http";
import { CrefiaCardProvider } from "src/modules/user/crefia/crefia.card.provider";
import { TokenProvider } from "src/modules/booster/token.provider";
import { DateRangeDto } from "src/modules/main/dto/date.range.dto";
import { decrypt, encrypt } from "src/utils/crypto";
import { insertLoopDateParser, parseDate, parseDay, parseMonth } from "src/utils/date";
import { hyphenTokenRefresh } from "src/utils/hyphen.token.refresh";
import { DataSource } from "typeorm";
import { RegistCrefiaDto } from "../dto/regist.crefia.dto";
import { UserProvider } from "../user.provider";
import { CrefiaPurchaseProvider } from "./crefia.purchase.provider";
import { CrefiaDepositProvider } from "./crefia.deposit.provider";
import { CrefiaUnPurchaseProvider } from "./crefia.unpurchase.provider";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { Constants } from "src/constants/constants";
import { SET_TIME, timeout } from "src/utils/timeout";
import { Endpoint } from "src/constants/endpoint";
import { FirebaseCloudMessage } from "src/utils/firebase.cloud.message";
import { FcmType } from "src/constants/fcm.type";
import { AlertProvider } from "../alert/alert.provider";
import { CreateAlertVO } from "../alert/vo/create.alert.vo";
import { CrefiaFeeProvider } from "./crefia.fee.provider";

@Injectable()
export class CrefiaService {
  constructor(
    private readonly userPvd : UserProvider,
    private readonly cardPvd : CrefiaCardProvider,
    private readonly purchasePvd : CrefiaPurchaseProvider,
    private readonly depositPvd : CrefiaDepositProvider,
    private readonly unPurchasePvd : CrefiaUnPurchaseProvider,
    private readonly feePvd : CrefiaFeeProvider,
    private readonly datasource : DataSource,
    private readonly alertPvd : AlertProvider,
    private readonly tokenPvd : TokenProvider
  ){}

  public async test(biz : string) : Promise<ServiceData> {
    let recent = await this.cardPvd.test(biz);
    return ServiceData.ok("test" , recent , 2101);
  }

  public async registCrefia(
    user : User , 
    body : RegistCrefiaDto
  ) : Promise<ServiceData> {
    let b : UserBusiness = null;
    if(body.business_id) {
      b = user.getBusiness(body.business_id);
      if(!b) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'user',
        )
      }
    }
    let check = await this.checkCrefiaUser(body);
    if(check['resCd'] !== '0000') {
      //토큰 재발급 후 호출
      check = await this.checkCrefiaUser(body);
    } 
    // 비밀번호가 일치하지 않을 때 scheduler
    if(check['out']['errYn'] === 'Y') {
      return ServiceData.invalidRequest(check['out']['errMsg'] , 4104,'user' )
    }
    if(!check['out']['outB0001']['list']) {
      return await this.registCrefia(user , body);
    }

    try {
      let bizes = check['out']['outB0001']['list'] as Array<Object>;

      // 등록된 사업자 번화와 같은 경우
      let business : UserBusiness = null;
      if(b) {
        for(let i = 0 ; i < bizes.length ; i++) {
          if(bizes[i]['bizNo'] === b.business_number) {
            b.crefia_id = body.crefia_id,
            b.crefia_password = body.crefia_password,
            b.crefia_updated_at = new Date(),
            b.member_group_id = bizes[i]['memGrpId'],
            // 홈택스 사업장명이 정확하기 때문에 사업장 명이 등록되어 있다면 등록하지 않음
            b.store_name = b.store_name === null 
            ? bizes[i]['memNm'] 
            : b.store_name,
            business = b
            await this.userPvd.changedBusiness(b , {
              crefia_id : body.crefia_id,
              crefia_password : await encrypt(body.crefia_password),
              crefia_updated_at : new Date(),
              member_group_id : bizes[i]['memGrpId'],
              // 홈택스 사업장명이 정확하기 때문에 사업장 명이 등록되어 있다면 등록하지 않음
              store_name : b.store_name === null 
              ? bizes[i]['memNm'] 
              : b.store_name,
            })
          }
        }
      } else {
        // FIXED 프론트 배포되면 다음에 삭제할 코드
        await Promise.all(user.businesses.map(async b => {
          for(let i = 0 ; i < bizes.length ; i++) {
            if(bizes[i]['bizNo'] === b.business_number) {
              b.crefia_id = body.crefia_id,
              b.crefia_password = body.crefia_password,
              b.crefia_updated_at = new Date(),
              b.member_group_id = bizes[i]['memGrpId'],
              // 홈택스 사업장명이 정확하기 때문에 사업장 명이 등록되어 있다면 등록하지 않음
              b.store_name = b.store_name === null 
              ? bizes[i]['memNm'] 
              : b.store_name,
              business = b
              await this.userPvd.changedBusiness(b , {
                crefia_id : body.crefia_id,
                crefia_password : await encrypt(body.crefia_password),
                crefia_updated_at : new Date(),
                member_group_id : bizes[i]['memGrpId'],
                // 홈택스 사업장명이 정확하기 때문에 사업장 명이 등록되어 있다면 등록하지 않음
                store_name : b.store_name === null 
                ? bizes[i]['memNm'] 
                : b.store_name,
              })
            }
          }
        }))
      }
      if(!business) {
        return ServiceData.ok(
          '사업자번호 정보가 일치하지 않아 연결할 수 없습니다.',
          {
            user : null
          },
          4101
        )
      }

      const newUser : User = await this.userPvd.joinById(
        user.id , 
        SelectHelper.user_select
      );
      /**
       * insert crefia card data
       */
      if(!business.crefia_login) {
        await this.userPvd.changedBusiness(
          business , 
          {
            crefia_login : true
          }
        )
        this.insertCrefia(
          user,
          business
        );
      }
      
      return ServiceData.ok(
        'Successfully regist crefia account',
        {
          user : newUser
        },
        2101
      );
    } catch(e) {
      console.log(e);
      return ServiceData.serverError();
    }
  }


  private async insertCrefia(
    user : User,
    business : UserBusiness,
  ) {
    const recentCard = await this.cardPvd.findRecentOne(business);
    const recentPurchase = await this.purchasePvd.findRecentOne(business);
    const recentDeposit = await this.depositPvd.findRecentOne(business);
    //local time
    let cardNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
    let purchaseNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
    let depositNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
    
    let cardDate;
    let purchaseDate;
    let depositDate;
    if (recentCard) {
      cardDate = new Date(new Date(recentCard.trade_date).getUTCFullYear() , new Date(recentCard.trade_date).getMonth() , 1);
    } else {
      let cardCreatedAt = new Date(new Date().setMonth(new Date(business.created_at).getMonth() + 1));
      cardDate = new Date(new Date().setFullYear(cardCreatedAt.getFullYear()-2));
    }
    if(recentPurchase) {
      purchaseDate = new Date(new Date(recentPurchase.trade_date).getUTCFullYear() , new Date(recentPurchase.trade_date).getMonth() , 1);
    } else {
      let purchaseCreatedAt = new Date(new Date().setMonth(new Date(business.created_at).getMonth() + 1));
      purchaseDate = new Date(new Date().setFullYear(purchaseCreatedAt.getFullYear()-2));
    }
    if(recentDeposit) {
      depositDate = new Date(new Date(recentDeposit.payment_date).getUTCFullYear() , new Date(recentDeposit.payment_date).getMonth() , 1);
    } else {
      let depositCreatedAt = new Date(new Date().setMonth(new Date(business.created_at).getMonth() + 1));
      depositDate = new Date(new Date().setFullYear(depositCreatedAt.getFullYear()-2));
    }

    /**
     * 카드 매출 , 매입 , 입금 daterange
     */
    const commonRange = new DateRangeDto();

    commonRange.start_date = parseDate(new Date(new Date().setDate(cardNow.getDate() - 10)));
    commonRange.end_date = parseDate(cardNow);
    // 수수료 대금 지급일
    let fees = await this.crefiaFeeRate(
      business.crefia_id,
      business.crefia_password,
      business.member_group_id
    );
    if(fees['common']['errYn'] !== 'N') {
      await timeout();
      //토큰 재발급 후 호출
      fees = await this.crefiaFeeRate(
        business.crefia_id,
        business.crefia_password,
        business.member_group_id
      );
    }
    // 수수료율
    const rates = fees['data']['list'] as Array<Object>;
    // insert crefia fee rates
    rates.forEach(rate => {
      this.feePvd.insertFee(business,rate)
    })

    //start
    // 당일 카드 매출 조회
    await this.insertCrefiaCard(
      business , 
      commonRange,
      rates
    );
    //카드 매출 조회 시작
    for(let card = cardNow ; cardDate <= card; card.setMonth(card.getMonth()-1)) {
      const dateRange = insertLoopDateParser(card);
      await this.insertCrefiaCard(
        business , 
        dateRange,
        rates
      );
      await timeout(SET_TIME);
    }

    // 매입 조회 시작
    await this.insertCrefiaPurchase(business , commonRange);
    for(let purchase = purchaseNow ;  purchaseDate <= purchase; purchase.setMonth(purchase.getMonth()-1)) {
      const dateRange = insertLoopDateParser(purchase);
      await this.insertCrefiaPurchase(business , dateRange)
      await timeout(SET_TIME);
    }

    // 입금 조회 시작
    await this.insertCrefiaDeposit(business , commonRange);
    for(let deposit = depositNow ;  depositDate <= deposit ; deposit.setMonth(deposit.getMonth()-1)) {
      const dateRange = insertLoopDateParser(deposit);
      await this.insertCrefiaDeposit(business , dateRange)
      await timeout(SET_TIME);
    }
    // 미매입 찾아서 insert
    await this.insertUnpurchase(business);
    // 데이터를 다 받아오고 나서 상태값을 바꿔줌
    await this.userPvd.changedBusiness(
      business , 
      {
        crefia_login : false
      }
    )
    // (수정) 알림
    await this.alertPvd.createAlert(
      business,
      new CreateAlertVO(
        '새로운 연결기관 매출정보',
        '여신금융협회 매출 정보 불러오기를 완료했어요.', // 리팩토링
        business.id,
        Number(FcmType.CREFIA),
        false
      )
    )
    const devices = await Promise.all(user.devices.filter((device) => {
      if(device.token) {
        FirebaseCloudMessage.registAccount(
          FcmType.MESSAGE_TYPE[FcmType.CREFIA].title,
          FcmType.MESSAGE_TYPE[FcmType.CREFIA].body,
          FcmType.CREFIA,
          business,
          device.token
        )
        return device
      }
    })).then((result) => {
      return result
    })
    if(devices.length === 0) {
      // (수정) web kakao sync message
      console.log('kakao message')
    }
  }

  private async checkCrefiaUser(body : RegistCrefiaDto) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    const date = new Date();
    const rangeDate = new Date(new Date(date).setDate(new Date(date).getDate() - 1));

    const selectString = `${rangeDate.getFullYear()}${parseMonth(rangeDate.getMonth())}${parseDay(rangeDate.getDate())}`;
    const rangeString = `${date.getFullYear()}${parseMonth(date.getMonth())}${parseDay(date.getDate())}`;
    return await http.post(
      Endpoint.CREFIA_USER_INFO,
      {
        userId : body.crefia_id,
        userPw : body.crefia_password,
        fromDate : selectString,
        toDate : rangeString
      }
    )
  }

  public async crefiaCard(
    crefiaId : string,
    crefiaPw : string,
    memberGroupId : string,
    startDate : string,
    endDate : string,
    detailYN : string
  ) {
    try {
      const http = await new CustomHttp(
        Urls.HYPHEN_DATA_MARKET,
        {
          // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
          'user-id' : Constants.HYPHEN_ID,
          Hkey : Constants.HYPHEN_KEY
        }
      );

      let cards = await http.post(
        Endpoint.CREFIA_APPROVAL_CARD, // endpoint
        {
          userId: crefiaId,
          userPw: crefiaPw,
          memGrpId : memberGroupId,
          fromDate: startDate,
          toDate: endDate,
          detailYn: detailYN,
          unpchYn: 'N'
        }
      );
      if(!cards['out']['outB0011']['listDtl']) {
        await timeout();
        return await this.crefiaCard(
          crefiaId,
          crefiaPw,
          memberGroupId,
          startDate,
          endDate,
          detailYN,
        )
      }
      const cardList = cards['out']['outB0011']['listDtl'] as Array<Object>
      if(cardList === undefined) {
        await timeout();
        return await this.crefiaCard(crefiaId , crefiaPw , memberGroupId , startDate , endDate , detailYN);
      }
      const check = cardList.filter(card => {
        return card['cardNum'] === null
      });
      //cardNum이 null이 존재 하면 재귀함수 호출
      if(0 < check.length) {
        await timeout();
        return await this.crefiaCard(crefiaId , crefiaPw , memberGroupId , startDate , endDate , detailYN);
      }
      return cards;
    } catch(e) {
      console.log("cardHttp",e);
      return null;
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
        await decrypt(business.crefia_password),
        business.member_group_id,
        query.start_date,
        query.end_date,
        "Y"
      )
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.crefiaCard(
          business.crefia_id,
          await decrypt(business.crefia_password),
          business.member_group_id,
          query.start_date,
          query.end_date,
          "Y"
        )
      } 
      if(!data['out']['outB0011']['listDtl']) {
        await timeout();
        return await this.insertCrefiaCard(business , query ,rates);
      }
      
      const list = data['out']['outB0011']['listDtl'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          //call provider set data
          this.cardPvd.upsert(business , data , rates);
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
    try {
      const http = await new CustomHttp(
        Urls.HYPHEN_DATA_MARKET,
        {
          // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
          'user-id' : Constants.HYPHEN_ID,
          Hkey : Constants.HYPHEN_KEY
        }
      );
      
      return await http.post(
        Endpoint.CREFIA_PURCHASE_CARD,
        {
          userId: crefiaId,
          userPw: crefiaPw,
          memGrpId : memberGroupId,
          fromDate: startDate,
          toDate: endDate,
          detailYn: detailYN,
        }
      )
    } catch(e) {
      console.log('purchaseHttp::',e)
      return null;
    }
  }

  private async insertCrefiaPurchase(
    business : UserBusiness,
    query : DateRangeDto
  ) {
    try {
      let data = await this.crefiaPurchase(
        business.crefia_id,
        await decrypt(business.crefia_password),
        business.member_group_id,
        query.start_date,
        query.end_date,
        "Y"
      )
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.crefiaPurchase(
          business.crefia_id,
          await decrypt(business.crefia_password),
          business.member_group_id,
          query.start_date,
          query.end_date,
          "Y"
        )
      } 
      if(!data['out']['outB0021']['listDtl']) {
        await timeout();
        return await this.insertCrefiaPurchase(business , query);
      }
      
      const list = data['out']['outB0021']['listDtl'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          //해외 / 기타인 매입은 수수료 업데이트
          if(data['cardDiv'] === '해외' || data['cardDiv'] === '기타') {
            this.cardPvd.updateCommission(data);
          }
          //call provider set data
          this.purchasePvd.upsert(business , data);
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
    try {
      const http = await new CustomHttp(
        Urls.HYPHEN_DATA_MARKET,
        {
          // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
          'user-id' : Constants.HYPHEN_ID,
          Hkey : Constants.HYPHEN_KEY
        }
      );
      
      return await http.post(
        Endpoint.CREFIA_DEPOSIT_CARD,
        {
          userId: crefiaId,
          userPw: crefiaPw,
          memGrpId : memberGroupId,
          fromDate: startDate,
          toDate: endDate,
          detailYn: detailYN,
        }
      )
    } catch(e) {
      console.log('depositHttp',e);
      return null;
    }
  }

  private async insertCrefiaDeposit(
    business : UserBusiness,
    query : DateRangeDto
  ) {
    try {
      let data = await this.crefiaDeposit(
        business.crefia_id,
        await decrypt(business.crefia_password),
        business.member_group_id,
        query.start_date,
        query.end_date,
        "Y"
      )
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.crefiaDeposit(
          business.crefia_id,
          await decrypt(business.crefia_password),
          business.member_group_id,
          query.start_date,
          query.end_date,
          "Y"
        )
      } 

      if(!data['out']['outB0031']['listDtl']) {
        return await this.insertCrefiaDeposit(business , query);
      } 
      
      const list = data['out']['outB0031']['listDtl'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          this.depositPvd.upsert(business , data);
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
    return await http.post(
      Endpoint.CREFIA_FEE_RATE,
      {
        userId : crefia_id,
        userPw : crefia_password,
        memGrpId : groupId
      }
    )
  }

  private async insertUnpurchase(
    business : UserBusiness
  ) : Promise<void> {
    try {
      // 승인건에 대한 값들 가져오기
      const sales : CrefiaCard[] = await this.cardPvd.findDiv(
        business , 
        1
      ) as CrefiaCard[];
      const arr = [];
      for(let i = 0 ; i < sales.length ; i++) {
        const purchase = await this.purchasePvd.findOne(business ,sales[i]);
        const cards : CrefiaCard[] = await this.cardPvd.findCancelOne(
          business , 
          sales[i]
        ) as CrefiaCard[];

        //매입예정에 존재하지 않고 결제도 없는 경우
        if(!purchase && cards.length !== 2) {
          //insert crefia_unpurchases
          await this.unPurchasePvd.upsert(business,sales[i]);
        }
      }
    } catch(e) {
      // (수정)
    }
  }
}