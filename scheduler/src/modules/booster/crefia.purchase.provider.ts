import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaPurchase } from "src/entities/booster/crefia/crefia.purchase.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CardCompany } from "src/enums/card.code";
import { ReportType } from "src/enums/user/report/report.type";
import { parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { DayDto } from "../home/dto/day.dto";

@Injectable()
export class CrefiaPurchaseProvider {
  static models = [
    CrefiaPurchase
  ]

  constructor(
    @InjectRepository(CrefiaPurchase)
    private readonly purchaseRepo : Repository<CrefiaPurchase>
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
      console.log(e);
    }
  }

  public async dayPurchase(
    businessNumber : string,
		startDate : string,
		endDate : string,
		dto : DayDto
  ) : Promise<CrefiaPurchase[]> {
    try {
      const query = await this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .select([
          `DATE_FORMAT(${SchemaNames.crefia_purchases}.payment_date , '%Y%m%d') AS payDt`,
          `SUM(
            ${SchemaNames.crefia_purchases}.payment_amount
            ) AS buySumAmt`,
          `COUNT(*) AS buySumCnt`,
          `SUM(
            ${SchemaNames.crefia_purchases}.commission_sum
            ) AS commSum`,
          `SUM(
            ${SchemaNames.crefia_purchases}.payment_amount - ${SchemaNames.crefia_purchases}.commission_sum
          ) AS paySumAmt`,
        ])
        .leftJoin(`${SchemaNames.crefia_purchases}.business` , 'business')
        .where(`business.business_number = :id` , {
          id : businessNumber
        })
        .andWhere(`${SchemaNames.crefia_purchases}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if(typeof(dto.card_code) === 'string' && dto.card_code !== '') {
        query.andWhere(`${SchemaNames.crefia_purchases}.card_code = :card_code`, {
          card_code: dto.card_code
        })
      }
      if(typeof(dto.card_code) === 'object' && dto.card_code.length !== 0) {
        let orString = '';
        dto.card_code.forEach((c , i) => {
          if(i === 0 ) {
            orString += `${SchemaNames.crefia_purchases}.card_company = '${c}' `;
          } else {
            orString += `OR ${SchemaNames.crefia_purchases}.card_company = '${c}' `;
          }
        })
        query.andWhere(`(${orString})`)
      }
      // if(dto.appr_yn === "Y" || dto.appr_yn === "N") {
      //   query.andWhere(`${SchemaNames.crefia_purchases}.purchase_appr_yn = :yn` , {
      //     yn : dto.appr_yn
      //   })
      // }
      // group
      return query
        .groupBy('payDt')
        .orderBy('payDt' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null
    }
  }

  public async findOne(
    business : UserBusiness,
    data : any
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
        trade_date : parseDashDate(data['trDt'])
      })
      .andWhere(`approval_no = :apprNo` , {
        apprNo : data['apprNo']
      })
      .andWhere(`card_no = :cardNo` , {
        cardNo : data['cardNum']
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

  public async findAll(date) : Promise<CrefiaPurchase[]> {
    try {
      return await this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .select()
        .where(`${SchemaNames.crefia_purchases}.trade_date > :date` , {
          date : date
        })
        .getMany()
    } catch(e) {
      console.log(e)
      return null
    }
  }

  public async kakaoPurchaseSum(
    business : UserBusiness,
    date : string,
    type : number
  ) {
    const format = {
      [ReportType.day] : '%Y-%m-%d', //day
      [ReportType.month] : '%Y-%m' //month
    }
    try {
      const query = this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .select([
          `SUM(${SchemaNames.crefia_purchases}.payment_amount) AS realAmt`,
          `${SchemaNames.crefia_purchases}.card_code AS card_code`,
          `${SchemaNames.crefia_purchases}.card_company AS card_company`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        if (type === ReportType.month) {
          query .andWhere(`DATE_FORMAT(${SchemaNames.crefia_purchases}.payment_date  , '${format[type]}') = :date` , {
            date : date,
          })
        } else {
          query.andWhere(`${SchemaNames.crefia_purchases}.payment_date = :date` , {
            date : date
          })
        }
      return await query.groupBy('card_code').getRawMany();
    } catch(e) {
      return null;
    }
  }

  // NOTE:push report에서 사용
  public async purchaseSum(
    business : UserBusiness,
    date : string,
    type : number
  ) {
    const format = {
      [ReportType.day] : '%Y-%m-%d', //day
      [ReportType.month] : '%Y-%m' //month
    }
    try {
      const query = this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .select([
          `SUM(${SchemaNames.crefia_purchases}.payment_amount) AS realAmt`,
          `${SchemaNames.crefia_purchases}.payment_date AS payDt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        if(type === ReportType.month) {
          query.andWhere(`DATE_FORMAT(${SchemaNames.crefia_purchases}.payment_date , '${format[type]}') = :date` , {
            date : date
          })
        } else {
          query.andWhere(`${SchemaNames.crefia_purchases}.payment_date = :date` , {
            date : date
          })
        }
        
      return await query.groupBy('payDt').getRawOne();
    } catch(e) {
      return null;
    }
  }

  public async findLastSettleDate(business : UserBusiness) {
    try {
      return await this.purchaseRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .select([
          `${SchemaNames.crefia_purchases}.payment_date`
        ])
        .where(`${SchemaNames.crefia_purchases}.business = :business` , {
          business : business.id
        })
        .orderBy(`payment_date` , 'DESC')
        .limit(1)
        .getOne()
    } catch(e) {
      return null;
    }
  }
}