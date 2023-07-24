import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { CrefiaUnPurchase } from "src/entities/booster/crefia/crefia.unpurchase.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CardCompany } from "src/enums/card.code";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class CrefiaUnPurchaseProvider {
  static models = [
    CrefiaUnPurchase
  ]

  constructor(
    @InjectRepository(CrefiaUnPurchase)
    private readonly unPurchaseRepo : Repository<CrefiaUnPurchase>
  ){}

  public async upsert(
    business : UserBusiness,
    data : any
  ) {
    try {
      const obj : QueryDeepPartialEntity<CrefiaUnPurchase> = {
        business : business,
        trade_date : `${parseDashDate(data['trDt'])} ${parseColonTime(data['trTm'])}`,
        card_company : data['cardCorp1'] ? data['cardCorp1'] : '',
        card_code : CardCompany[data['cardCorp1']] ? CardCompany[data['cardCorp1']] : 0,
        card_alliance : data['cardCorp2'],
        card_no : data['cardNum'],
        approval_no : data['apprNo'],
        approval_amount : Number(data['apprAmt']) ? Number(data['apprAmt']) : 0,
        inst_division : data['instDiv'] === '0 개월' ? '일시불' : data['instDiv'],
        member_no : data['merNo'],
        card_kind_code : Number(data['cardKndCd']),
        card_kind : data['cardKnd'],
        card_real_no : data['cardRealNo'],
        inst : data['insTrm'] === '00' ? 0 : Number(data['insTrm'])
      }
      await this.unPurchaseRepo.createQueryBuilder()
        .insert()
        .into(CrefiaUnPurchase)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'trade_date',
            'card_no',
            'approval_no',
            'member_no',
          ],
          overwrite: [
            'card_company',
            'card_code',
            'card_alliance',
            'approval_amount',
            'inst_division',
            'card_kind_code',
            'card_kind',
            'card_real_no',
            'inst',
          ]
        })
        .execute();
    } catch(e) {
      console.log(e);
    }
  }

  public async softDelete(
    business : UserBusiness,
    data : any | null | null = null // 매입 예정
  ) {
    try {
      await this.unPurchaseRepo.createQueryBuilder()
        .update(CrefiaUnPurchase)
        .set({
          // 한국시간
          deleted_at : new Date()
        })
        .where(`business = :bizNo` , {
          bizNo : business.id
        })
        .andWhere(`approval_no = :apprNo` , {
          apprNo : data['apprNo']
        })
        .andWhere(`card_no = :cardNo` , {
          cardNo : data['cardNum']
        })
        .execute();
    } catch(e) {
      console.log(e);
    }
  }
}