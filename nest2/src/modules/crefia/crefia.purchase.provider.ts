import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaPurchase } from "src/entities/booster/crefia/crefia.purchase.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ReportType } from "src/enums/user/report/report.type";
import { Repository } from "typeorm";

@Injectable()
export class CrefiaPurchaseProvider {
  constructor(
    @InjectRepository(CrefiaPurchase)
    private readonly purchaseRepo : Repository<CrefiaPurchase>
  ) {}

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