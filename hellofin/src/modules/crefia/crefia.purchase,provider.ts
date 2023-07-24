import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { CrefiaPurchase } from "src/entities/booster/crefia/crefia.purchase.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CardCompany } from "src/enums/card.code";
import { parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class CrefiaPurchaseProvider {
  constructor(
    @InjectRepository(CrefiaPurchase)
    private readonly purchaseRepo : Repository<CrefiaPurchase>
  ){}

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
}