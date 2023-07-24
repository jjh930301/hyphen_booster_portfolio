import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { CrefiaUnPurchase } from "src/entities/booster/crefia/crefia.unpurchase.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class CrefiaUnPurchaseProvider {
  constructor(
    @InjectRepository(CrefiaUnPurchase)
    private readonly unPurchaseRepo : Repository<CrefiaUnPurchase>
  ){}

  public async upsert(
    business : UserBusiness,
    sales : CrefiaCard
  ) {
    try {
      const obj : QueryDeepPartialEntity<CrefiaUnPurchase> = {
        business : business,
        trade_date : sales.trade_date,
        card_company : sales.card_company,
        card_code : sales.card_code,
        card_alliance : sales.card_alliance,
        card_no : sales.card_no,
        approval_no : sales.approval_no,
        approval_amount : sales.approval_amount,
        inst_division : sales.inst_division,
        member_no : sales.member_no,
        card_kind_code : sales.card_kind_code,
        card_kind : sales.card_kind,
        card_real_no : sales.card_real_no,
        inst : sales.inst,
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
    }
  }
}