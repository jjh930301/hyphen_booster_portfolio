import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ReportType } from "src/enums/user/report/report.type";
import { Repository } from "typeorm";

export class CrefiaCardsProvider {
  static models = [
    CrefiaCard
  ]
  constructor(
    @InjectRepository(CrefiaCard)
    private readonly cardRepo : Repository<CrefiaCard>
  ){}

  public async kakaoSum(
    business : UserBusiness,
    startDate : string ,
    endDate : string,
    type : number,
  ) {
    try {
      const format = {
        [ReportType.day] : '%Y-%m-%d',
        [ReportType.month] : '%Y-%m'
      }
      return await this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `SUM(
            CASE 
              WHEN ${SchemaNames.crefia_card}.trade_division = 1 
              THEN ${SchemaNames.crefia_card}.approval_amount 
              WHEN ${SchemaNames.crefia_card}.trade_division = 2 
              THEN -${SchemaNames.crefia_card}.approval_amount 
            ELSE 0 END) total`,
          `DATE_FORMAT(${SchemaNames.crefia_card}.trade_date , '${format[type]}') AS date`,
        ])
        .where(`${SchemaNames.crefia_card}.business = :business` , {
          business : business.id
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy('date')
        .getRawOne()
    } catch(e) {
      console.log(e)
      return null;
    }
  }
}