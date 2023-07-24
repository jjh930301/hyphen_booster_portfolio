import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CardCompany } from "src/enums/card.code";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class CrefiaCardProvider {

  constructor(
    @InjectRepository(CrefiaCard)
    private readonly cardRepo : Repository<CrefiaCard>,
  ){}
  
  private async calcCommission(
    apprAmt : number,
    code : string,
    cardCorp : string,
    rates : Array<Object>
  ) : Promise<number> {
    let comm : number = apprAmt;
    rates.forEach((rate) => {
      //카드사 명과 신용카드일 경우
      if(rate['cardNm'] === cardCorp && code === '신용') {
        comm = Math.floor((Number(rate['sinYongFeeRate']) * 0.01) * apprAmt)
      }
    })
    if(comm === apprAmt) return comm = comm * 0.01
    return comm;
  }

  public async updateCommission(data : any) {
    try {
      await this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .update(CrefiaCard)
        .set({
          commission : data['commSum']
        })
        .where(`date_format(trade_date , '%Y-%m-%d') = :trade_date` , {trade_date : parseDashDate(data['trDt'])})
        .andWhere('card_no = :card_no' , {card_no : data['cardNum']})
        .andWhere('approval_no = :apprNo' , {apprNo : data['apprNo']} )
        .andWhere('member_no = :memNo' , {memNo : data['merNo']})
        .execute();
    } catch(e) {
      console.log('Failure update commission');
    }
  }

  public async upsert(
    business : UserBusiness,
    data : any,
    rates : Array<Object>
  ) {
    try {
      const obj : QueryDeepPartialEntity<CrefiaCard>= {
        business : business,
        pk_date : `${parseDashDate(data['trDt'])}`,
        trade_date : `${parseDashDate(data['trDt'])} ${parseColonTime(data['trTm'])}`,
        trade_division : data['trDiv'] === '승인' ? 1 : 2,
        commission : await this.calcCommission(
          Number(data['apprAmt']),
          data['cardKnd'],
          data['cardCorp1'],
          rates
        ),
        card_company : data['cardCorp1'] ? data['cardCorp1'] : '',
        card_code : CardCompany[data['cardCorp1']] ? CardCompany[data['cardCorp1']] : 0,
        card_alliance : data['cardCorp2'] ? data['cardCorp2'] : '',
        card_no : data['cardNum'],
        approval_no : data['apprNo'],
        approval_amount : data['trDiv'] === '승인' ? 
          Number(data['apprAmt']) : 
          Math.abs(Number(data['apprAmt'])),
        inst_division : data['instDiv'] === '0 개월' ? '일시불' : data['instDiv'],
        member_no : data['merNo'],
        card_kind_code : Number(data['cardKndCd']),
        card_kind : data['cardKnd'],
        card_real_no : data['cardRealNo'],
        inst : data['insTrm'] === '00' ? 0 : Number(data['insTrm'])
      }
      await this.cardRepo.createQueryBuilder()
        .insert()
        .into(CrefiaCard)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'business',
            'pk_date',
            'trade_division',
            'approval_no',
          ],
          overwrite: [
            'trade_date',
            'commission',
            'card_company',
            'card_code',
            'card_alliance',
            'card_no',
            'approval_amount',
            'inst_division',
            'member_no',
            'card_kind_code',
            'card_kind',
            'card_real_no',
            'inst',
          ]
        })
        .execute();
    } catch(e) {
    }
  }

  public async findDiv(
    business : UserBusiness , 
    type : number
  ) : Promise<CrefiaCard[] | CrefiaCard> {
    try {
      const query = this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `${SchemaNames.crefia_card}.approval_no AS approval_no`,
          `date_format(${SchemaNames.crefia_card}.trade_date , '%Y-%m-%d %H:%i:%s') AS trade_date`,
          `${SchemaNames.crefia_card}.card_no AS card_no`,
          `${SchemaNames.crefia_card}.card_company AS card_company`,
          `${SchemaNames.crefia_card}.card_code AS card_code`,
          `${SchemaNames.crefia_card}.card_alliance AS card_aliance`,
          `${SchemaNames.crefia_card}.card_real_no AS card_real_no`,
          `${SchemaNames.crefia_card}.approval_amount AS approval_amount`,
          `${SchemaNames.crefia_card}.inst_division AS inst_division`,
          `${SchemaNames.crefia_card}.member_no AS member_no`,
          `${SchemaNames.crefia_card}.card_real_no AS card_real_no`,
          `${SchemaNames.crefia_card}.card_kind AS card_kind`,
          `${SchemaNames.crefia_card}.card_kind_code AS card_kind_code`,
          `${SchemaNames.crefia_card}.inst AS inst`,
        ])
        .where(`business = :bizNo` , {
          bizNo : business.id
        })
        .andWhere(`trade_division = :type` , {
          type : type
        })
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }
  
  public async findCancelOne(
    business : UserBusiness,
    sales : CrefiaCard
  ) : Promise<CrefiaCard[]> {
    try {
      const query = this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `${SchemaNames.crefia_card}.approval_no AS approval_no`,
          `${SchemaNames.crefia_card}.trade_date AS trade_date`,
          `${SchemaNames.crefia_card}.card_no AS card_no`,
          `${SchemaNames.crefia_card}.card_company AS card_company`,
          `${SchemaNames.crefia_card}.card_alliance AS card_aliance`,
          `${SchemaNames.crefia_card}.approval_amount AS approval_amount`,
          `${SchemaNames.crefia_card}.commission AS commission`,
          `${SchemaNames.crefia_card}.inst_division AS inst_division`,
          `${SchemaNames.crefia_card}.member_no AS member_no`,
        ])
        .where(`business = :bizNo` , {
          bizNo : business.id
        })
        .andWhere(`approval_no = :apprNo` , {
          apprNo : sales.approval_no
        })
        .andWhere(`card_no = :cardNo` , {
          cardNo : sales.card_no
        })
        .getRawMany();
        
      return await query
    } catch(e) {
      return null
    }
  }
}