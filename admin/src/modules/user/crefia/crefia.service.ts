import { Injectable } from "@nestjs/common";
import { Constants } from 'src/constants/constants';
import { Endpoint } from 'src/constants/endpoint';
import { Urls } from 'src/constants/urls';
import { CrefiaCard } from 'src/entities/booster/crefia/crefia.card.entity';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { ServiceData } from "src/models";
import { CustomHttp } from "src/models/custom.http";
import { DateRangeDto } from "src/modules/dashboard/dto/date.range.dto";
import { decrypt } from "src/utils/crypto";
import { insertLoopDateParser, parseDate } from "src/utils/date";
import { timeout } from "src/utils/timeout";
import { InsertDto } from "../dto/insert.dto";
import { UserBusinessProvider } from "../user.business.provider";
import { CrefiaCardProvider } from "./crefia.card.provider";
import { CrefiaDepositProvider } from "./crefia.deposit.provider";
import { CrefiaPurchaseProvider } from "./crefia.purchase.provider";
import { CrefiaUnPurchaseProvider } from "./crefia.unpurchase.provider";

@Injectable()
export class CrefiaService {

  constructor(
    private readonly businessPvd : UserBusinessProvider,
    private readonly cardPvd : CrefiaCardProvider,
    private readonly purchasePvd : CrefiaPurchaseProvider,
    private readonly depositPvd : CrefiaDepositProvider,
    private readonly unPurchasePvd : CrefiaUnPurchaseProvider,
  ){}

  public async crefia(
    dto : InsertDto
  ) : Promise<ServiceData> {
    try {
      const business = await this.businessPvd.findByIdAccount(dto.business_id , 1)
      let fees = await this.crefiaFeeRate(
        business.id,
        business.password,
        business.member_id
      );
      const text = String(fees['common']['errMsg']).split(' ')[1]
      if(fees['common']['errYn'] === 'Y' && text === '비밀번호가') {
        return ServiceData.invalidRequest(fees['common']['errMsg'] , 4101, 'result')
      }
      this.crefiaData(business , dto);
      return ServiceData.ok('Successfully insert crefia data' , {result : true} , 2101)
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  private async crefiaData(
    business : UserBusiness,
    dto : InsertDto
  ) {
    try {
      
      //local time
      let cardNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
      let purchaseNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
      let depositNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
      //business created_at
      let cardCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
      let purchaseCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
      let depositCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
      //before one year
      const cardDate = new Date(new Date().setFullYear(cardCreatedAt.getFullYear()-2));
      const purchaseDate = new Date(new Date().setFullYear(purchaseCreatedAt.getFullYear()-2));
      const depositDate = new Date(new Date().setFullYear(depositCreatedAt.getFullYear()-2));

      /**
       * 카드 매출 , 매입 , 입금 daterange
       */
      const commonRange = new DateRangeDto();

      if(dto.start_date && dto.end_date) {
        commonRange.start_date = dto.start_date;
        commonRange.end_date = dto.end_date;
      } else {
        commonRange.start_date = parseDate(new Date(new Date().setDate(cardNow.getDate() - 10)));
        commonRange.end_date = parseDate(cardNow);
      }
      

      // 수수료 대금 지급일
      let fees = await this.crefiaFeeRate(
      business.id,
        await decrypt(business['password']),
        business['member_id']
      );
      if(fees['common']['errYn'] !== 'N') {
        //토큰 재발급 후 호출
        fees = await this.crefiaFeeRate(
          business['comp_id'],
          await decrypt(business['password']),
          business['member_id']
        );
      }
      // 수수료율
      const rates = fees['data']['list'] as Array<Object>;
      //start
      // 당일 카드 매출 조회
      await this.insertCrefiaCard(
        business , 
        commonRange,
        rates
      );
      await this.insertCrefiaPurchase(business , commonRange);
      await this.insertCrefiaDeposit(business , commonRange);
      if(!dto.start_date || !dto.end_date) {
        //카드 매출 조회 시작
        for(let card = cardNow ; cardDate <= card; card.setMonth(card.getMonth()-1)) {
          const dateRange = insertLoopDateParser(card);
          await this.insertCrefiaCard(
            business , 
            dateRange,
            rates
          );
        }
        // 매입 조회 시작
        for(let purchase = purchaseNow ;  purchaseDate <= purchase; purchase.setMonth(purchase.getMonth()-1)) {
          const dateRange = insertLoopDateParser(purchase);
          await this.insertCrefiaPurchase(business , dateRange)
        }

        // 입금 조회 시작
        for(let deposit = depositNow ;  depositDate <= deposit ; deposit.setMonth(deposit.getMonth()-1)) {
          const dateRange = insertLoopDateParser(deposit);
          await this.insertCrefiaDeposit(business , dateRange)
        }
      }
      
      // 미매입 찾아서 insert
      await this.insertUnpurchase(business);
    } catch(e) {
      return null
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
        userPw : await decrypt(crefia_password),
        memGrpId : groupId
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
        business['comp_id'],
        await decrypt(business['password']),
        business['member_id'],
        query.start_date,
        query.end_date,
        "Y"
      )
      if(data['resCd'] !== '0000') {
        data = await this.crefiaCard(
          business['comp_id'],
          await decrypt(business['password']),
          business['member_id'],
          query.start_date,
          query.end_date,
          "Y"
        )
      } 
      if(!data['out']['outB0011']['listDtl']) {
        return await this.insertCrefiaCard(business , query ,rates);
      }
      
      const list = data['out']['outB0011']['listDtl'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          //call provider set data
          this.cardPvd.upsert(business , data , rates);
        })
      }
      
    } catch(e) {}
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
        business['comp_id'],
        await decrypt(business['password']),
        business['member_id'],
        query.start_date,
        query.end_date,
        "Y"
      )
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.crefiaPurchase(
          business['comp_id'],
          await decrypt(business['password']),
          business['member_id'],
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
    } catch(e) {}
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
        business['comp_id'],
        await decrypt(business['password']),
        business['member_id'],
        query.start_date,
        query.end_date,
        "Y"
      )
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.crefiaDeposit(
          business['comp_id'],
          await decrypt(business['password']),
          business['member_id'],
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
    }
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