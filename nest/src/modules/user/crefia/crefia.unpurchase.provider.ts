import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { CrefiaUnPurchase } from "src/entities/booster/crefia/crefia.unpurchase.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { PaginationDto } from "src/modules/main/dto/pagination.dto";
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

  public async softDelete(
    business : UserBusiness,
    sales : CrefiaCard | null = null, // 카드 매출
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
          apprNo : sales.approval_no
        })
        .andWhere(`card_no = :cardNo` , {
          cardNo : sales.card_no
        })
        .execute();
    } catch(e) {
      console.log(e);
    }
  }

  public async unpurchases(
    business : UserBusiness,
    date : string,
    page : PaginationDto
  ) {
    try {
      const query = this.unPurchaseRepo.createQueryBuilder(SchemaNames.crefia_unpurchases)
        .select([
          `${SchemaNames.crefia_unpurchases}.approval_no AS apprNo`,
          `date_format(${SchemaNames.crefia_unpurchases}.trade_date , '%Y-%m-%d %H:%i:%s') AS trDt`,
          `${SchemaNames.crefia_unpurchases}.card_no AS cardNo`,
          `${SchemaNames.crefia_unpurchases}.card_company AS cardCorp1`,
          `${SchemaNames.crefia_unpurchases}.card_code AS cardCode`,
          `${SchemaNames.crefia_unpurchases}.card_alliance AS cardAliance`,
          `${SchemaNames.crefia_unpurchases}.approval_amount AS apprAmt`,
          `${SchemaNames.crefia_unpurchases}.inst_division AS instDiv`,
          `${SchemaNames.crefia_unpurchases}.member_no AS memNo`,
          `${SchemaNames.crefia_unpurchases}.inst AS inst`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.crefia_unpurchases}.deleted_at is not null`)
        .andWhere(`${SchemaNames.crefia_unpurchases}.trade_date <= :date` , {
          date : date
        })
      query
        .orderBy('trDt' , 'ASC')
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
      return await query.getRawMany();
    } catch(e) {
      return [];
    }
  }
}