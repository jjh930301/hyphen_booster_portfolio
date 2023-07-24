import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { CrefiaPurchase } from "src/entities/booster/crefia/crefia.purchase.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CardCompany } from "src/enums/card.code";
import { CardListDto } from "src/modules/main/dto/card.list.dto";
import { PaginationDto } from "src/modules/main/dto/pagination.dto";
import { CardSalesDto } from "src/modules/main/purchase/dto/card.sales.dto";
import { parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class CrefiaPurchaseProvider {
  static models = [
    CrefiaPurchase
  ]

  constructor(
    @InjectRepository(CrefiaPurchase)
    private readonly purchaseRepo : Repository<CrefiaPurchase>,
    @InjectRepository(UserBusiness)
    private readonly bizRepo : Repository<UserBusiness>,
  ) {}

  public async upsert(
    business : UserBusiness,
    data : any
  ) : Promise<void> {
    try {
      const obj : QueryDeepPartialEntity<CrefiaPurchase> = {
        business : business,
        trade_date : parseDashDate(data['trDt']),
        buy_date : data['buyDt'],
        approval_no : data['apprNo'],
        card_company : data['cardCorp1'],
        card_code : CardCompany[data['cardCorp1']] ? CardCompany[data['cardCorp1']] : 0,
        card_alliance : data['cardCorp2'],
        card_no : data['cardNum'] ,
        card_division : data['cardDiv'],
        buy_amount : Number(data['buyAmt']),
        commission_member : Number(data['commMem']),
        commission_point : Number(data['commPoint']),
        commission_etc : Number(data['commEtc']),
        payment_amount : Number(data['payAmt']),
        payment_date : parseDashDate(data['payDt']),
        card_division_code : Number(data['cardDivCd']),
        member_no : data['merNo'],
        commission_sum : Number(data['commSum']),
        commission_vat : Number(data['commVat']),
      };
      
      await this.purchaseRepo.createQueryBuilder()
        .insert()
        .into(CrefiaPurchase)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'business',
            'buy_date',
            'approval_no',
            'card_no',
          ],
          overwrite : [
            'trade_date',
            'card_company',
            'card_code',
            'card_alliance',
            'card_division',
            'buy_amount',
            'commission_member',
            'commission_point',
            'commission_etc',
            'payment_amount',
            'payment_date',
            'card_division_code',
            'commission_sum',
            'commission_vat',
            'member_no'
          ]
        })
        .execute();
    } catch(e) {
    }
  }

  public async calendar(
    business : UserBusiness,
    startDate : string,
    endDate : string
  ) {
    try {
      const query = this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .select([
          `DATE_FORMAT(${SchemaNames.crefia_purchases}.payment_date , '%Y%m%d') AS payDt `,
          `SUM(${SchemaNames.crefia_purchases}.payment_amount) AS payAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.crefia_purchases}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy('payDt')
        .orderBy('payDt' , 'ASC')
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async dayPurchase(
    business : UserBusiness,
		startDate : string,
		endDate : string,
    type : number,
    list : CardListDto
  ) : Promise<CrefiaPurchase[]> {
    try {
      let cards : Array<string> = null;
      if(list?.cards) {
        cards = JSON.parse(list.cards) as Array<string>
      }
      const query = this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .select([
          type === 0 ?
          `DATE_FORMAT(${SchemaNames.crefia_purchases}.payment_date , '%Y%m%d') AS payDt, 
          DATE_FORMAT(${SchemaNames.crefia_purchases}.trade_date , '%Y%m%d') AS trDt, 
          DATE_FORMAT(${SchemaNames.crefia_purchases}.buy_date , '%Y%m%d') AS buyDt` :
          `${SchemaNames.crefia_purchases}.card_company as cardCorp1 `,
          `SUM(
            ${SchemaNames.crefia_purchases}.buy_amount
            ) AS buySumAmt`,
          `COUNT(*) AS buySumCnt`,
          `SUM(
            ${SchemaNames.crefia_purchases}.commission_sum
            ) AS commSum`,
          `SUM(
            ${SchemaNames.crefia_purchases}.payment_amount
          ) AS paySumAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.crefia_purchases}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if(cards !== null) {
        //카드사 선택
        if(typeof(cards) === 'string' && cards !== '') {
          query.andWhere(`${SchemaNames.crefia_purchases}.card_code = :card_code`, {
            card_code: cards
          })
        }
        if(typeof(cards) === 'object' && cards.length !== 0) {
          let orString = '';
          cards.forEach((c , i) => {
            if(i === 0 ) {
              orString += `${SchemaNames.crefia_purchases}.card_code = '${c}' `;
            } else {
              orString += `OR ${SchemaNames.crefia_purchases}.card_code = '${c}' `;
            }
          })
          query.andWhere(`(${orString})`)
        }
      }
      
      if(type === 0) {
        return await query.groupBy('payDt').orderBy('payDt' , 'ASC').getRawMany();
      }
      if(type === 1) {
        return await query.groupBy('cardCorp1').getRawMany();
      }
      // group
      return null;
    } catch(e) {
      return null
    }
  }

  public async dayPurchaseList(
    business : UserBusiness,
    startDate : string | null = null,
    endDate : string | null = null,
    card : CardListDto,
    page : PaginationDto,
    word : string | null = null
  ) : Promise<CrefiaPurchase[]> {
    try {
      let cards : Array<string> = null;
      if(card?.cards) {
        cards = JSON.parse(card.cards) as Array<string>
      }
      const query = this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .select([
          `DATE_FORMAT(${SchemaNames.crefia_purchases}.payment_date , '%Y%m%d') AS payDt`, 
          `DATE_FORMAT(${SchemaNames.crefia_purchases}.trade_date , '%Y%m%d') AS trDt`, 
          `DATE_FORMAT(${SchemaNames.crefia_purchases}.buy_date , '%Y%m%d') AS buyDt`,
          `${SchemaNames.crefia_purchases}.approval_no AS apprNo`,
          `${SchemaNames.crefia_purchases}.member_no AS memNo`,
          `${SchemaNames.crefia_purchases}.card_company AS cardCorp1`,
          `${SchemaNames.crefia_purchases}.card_no AS cardNum`,
          `${SchemaNames.crefia_purchases}.card_division AS cardiv`,
          `${SchemaNames.crefia_purchases}.payment_amount AS payAmt`,
          `${SchemaNames.crefia_purchases}.buy_amount AS buyAmt`,
          `${SchemaNames.crefia_purchases}.commission_sum AS comm`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
      if(word != null && typeof(Number(word)) === 'number') {
        const like = `
          ${SchemaNames.crefia_purchases}.payment_amount LIKE :word 
          OR ${SchemaNames.crefia_purchases}.approval_no LIKE :word 
        `
        query.andWhere(`(${like})` , {word : `%${word}%`})
      }
      if(startDate != null && endDate != null) {
        query.andWhere(`${SchemaNames.crefia_purchases}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      if(cards) {
        //카드사 선택
        if(typeof(cards) === 'string' && cards !== '') {
          query.andWhere(`${SchemaNames.crefia_purchases}.card_code = :card_code`, {
            card_code: cards
          })
        }
        if(typeof(cards) === 'object' && cards.length !== 0) {
          let orString = '';
          cards.forEach((c , i) => {
            if(i === 0 ) {
              orString += `${SchemaNames.crefia_purchases}.card_code = '${c}' `;
            } else {
              orString += `OR ${SchemaNames.crefia_purchases}.card_code = '${c}' `;
            }
          })
          query.andWhere(`(${orString})`)
        }
      }
      
      query
        .orderBy('payDt' , 'DESC')
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async rangeSum(
    business : UserBusiness,
    startDate : string | null = null,
    endDate : string | null = null,
    card : CardListDto,
    word : string | null = null
  ) {
    try {
      let cards : Array<string> = null;
      if(card?.cards) {
        cards = JSON.parse(card.cards) as Array<string>
      }
      const query = this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .select([
          `SUM(${SchemaNames.crefia_purchases}.payment_amount) AS total`, // 지급금액
          `COUNT(${SchemaNames.crefia_purchases}.payment_amount) as sumCnt`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
      if(word != null && typeof(Number(word)) === 'number') {
        const like = `
          ${SchemaNames.crefia_purchases}.payment_amount LIKE :word 
          OR ${SchemaNames.crefia_purchases}.approval_no LIKE :word 
        `
        query.andWhere(`(${like})` , {word : `%${word}%`})
      }
      if(startDate != null && endDate != null) {
        query.andWhere(`${SchemaNames.crefia_purchases}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      if(cards) {
        //카드사 선택
        if(typeof(cards) === 'string' && cards !== '') {
          query.andWhere(`${SchemaNames.crefia_purchases}.card_code = :card_code`, {
            card_code: cards
          })
        }
        if(typeof(cards) === 'object' && cards.length !== 0) {
          let orString = '';
          cards.forEach((c , i) => {
            if(i === 0 ) {
              orString += `${SchemaNames.crefia_purchases}.card_code = '${c}' `;
            } else {
              orString += `OR ${SchemaNames.crefia_purchases}.card_code = '${c}' `;
            }
          })
          query.andWhere(`(${orString})`)
        }
      }
      const result = await query.getRawMany();
      return result[0]
    } catch(e) {
      return null;
    }
  }

  public async changed() {
    try {
      const purchases = await this.purchaseRepo.find();
      purchases.forEach(async purchase => {
        const business = await this.bizRepo.findOneBy({id : purchase.business.id});
        const obj : QueryDeepPartialEntity<CrefiaPurchase> = {
          business : business,
          trade_date : purchase.trade_date,
          buy_date : purchase.buy_date,
          approval_no : purchase.approval_no,
          card_company : purchase.card_company,
          card_code : CardCompany[purchase.card_company] ? CardCompany[purchase.card_company] : 0,
          card_alliance : purchase.card_alliance,
          card_no : purchase.card_no,
          card_division : purchase.card_division,
          buy_amount : purchase.buy_amount,
          commission_member : purchase.commission_member,
          commission_point : purchase.commission_point,
          commission_etc : purchase.commission_etc,
          payment_amount : purchase.payment_amount,
          payment_date : purchase.payment_date,
          card_division_code : purchase.card_division_code,
          member_no : purchase.member_no,
          commission_sum : purchase.commission_sum,
          commission_vat : purchase.commission_vat,
        };
        
        await this.purchaseRepo.createQueryBuilder()
          .insert()
          .into(CrefiaPurchase)
          .values(obj)
          .orUpdate({
            conflict_target : [
              'buy_date',
              'approval_no',
              'card_no',
            ],
            overwrite : [
              'card_code',
            ]
          })
          .execute();
      })
    } catch(e) {
    }
  }

  public async findOne(
    business : UserBusiness,
    sale : CrefiaCard
  ) {
    const raw = await this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
      .select([
        'business',
        `trade_date`,
        'approval_no',
        'card_no',
        'buy_amount'
      ])
      // .leftJoin(`${SchemaNames.crefia_purchases}.business` , 'business')
      .where(`business = :bizNo` , {
        bizNo : business.id
      })
      .andWhere(`trade_date = :trade_date` , {
        trade_date : sale.trade_date.toString().substring(0 , 10)
      })
      .andWhere(`approval_no = :apprNo` , {
        apprNo : sale.approval_no
      })
      .andWhere(`card_no = :cardNo` , {
        cardNo : sale.card_no
      })
      .getRawOne()
    return raw;
  }

  public async expectedPurchaseSum(
    business : UserBusiness,
    startDate : string,
    endDate : string,
  ) {
    try {
      const query = this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .select([
          `SUM(${SchemaNames.crefia_purchases}.payment_amount) AS total`
        ])
        .where(`${SchemaNames.crefia_purchases}.business = :business` , {
          business : business.id
        })
      if(endDate !== null) {
        query.andWhere(`${SchemaNames.crefia_purchases}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      } else {
        query.andWhere(`${SchemaNames.crefia_purchases}.payment_date >= :start_date` , {
          start_date : startDate
        })
      }
        
      return await query.getRawOne();
    } catch(e) {
      return null;
    }
  }

  public async findByApprCardNoTradeDate(
    business : UserBusiness , 
    query : CardSalesDto
  ) {
    try {
      return await this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .select([
          `${SchemaNames.crefia_purchases}.payment_amount AS payAmt`,
          `${SchemaNames.crefia_purchases}.payment_date AS payDt`,
          `${SchemaNames.crefia_purchases}.commission_sum AS comm`,
        ])
        .where(`${SchemaNames.crefia_purchases}.business = :bizUUID` , {
          bizUUID : business.id
        })
        //trade_date = '2022-12-14' and approval_no = '33464823' and card_no = '4221-55*-*-*'
        .andWhere(`${SchemaNames.crefia_purchases}.trade_date = :tradeDate` , {
          tradeDate : parseDashDate(query.date)
        })
        .andWhere(`${SchemaNames.crefia_purchases}.approval_no = :apprNo` , {
          apprNo : query.approval_no
        })
        .andWhere(`${SchemaNames.crefia_purchases}.card_no = :cardNo` , {
          cardNo : query.card_no
        })
        .getRawOne()

    } catch(e) {
      return null;
    }
  }

  public async findRecentOne(business : UserBusiness) : Promise<CrefiaPurchase> {
    try {
      return await this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .where(`${SchemaNames.crefia_purchases}.business = :business` , {
          business : business.id
        })
        .orderBy('trade_date' , 'DESC')
        .limit(1)
        .getOne()
    } catch(e) {  
      return null;
    }
  }

  // public async findGroupBy(
  //   business : UserBusiness,
  //   group : string
  // ) : Promise<CrefiaPurchase[]> {
  //   try {
  //     const query = this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
  //       .select([
  //         `DATE_FORMAT(${SchemaNames.crefia_purchases}.payment_date , '%Y%m%d') AS payDt`, 
  //         `SUM(
  //           ${SchemaNames.crefia_purchases}.payment_amount
  //         ) AS paySumAmt`,
  //       ])
  //       .where(`business = :bizId` , {
  //         bizId : business.id
  //       })
  //     return await query.groupBy(group).getRawMany();
  //   } catch(e) {
  //     return null;
  //   }
  // }
}