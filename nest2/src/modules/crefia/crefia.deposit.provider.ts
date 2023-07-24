import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaDeposit } from "src/entities/booster/crefia/crefia.deposit.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ReportType } from "src/enums/user/report/report.type";
import { Repository } from "typeorm";

export class CrefiaDepositProvider {
  static models = [
    CrefiaDeposit
  ]
  constructor(
    @InjectRepository(CrefiaDeposit)
    private readonly cardRepo : Repository<CrefiaDeposit>
  ){}

  public async kakaoDepositDate(
    business : UserBusiness,
    date : string,
    type : number
  ) : Promise<CrefiaDeposit[]> {
    try {
      const format = {
        [ReportType.day] : '%Y-%m-%d', //day
        [ReportType.month] : '%Y-%m' //month
      }
      const query = await this.cardRepo.createQueryBuilder(SchemaNames.crefia_deposit)
        .select([
          `SUM(
            ${SchemaNames.crefia_deposit}.sales_amount
          ) AS salesAmt`,
          `SUM(
            ${SchemaNames.crefia_deposit}.sales_count
          ) AS salesCnt`,
          `SUM(
            ${SchemaNames.crefia_deposit}.real_payment_amount
          ) AS realAmt`,
          `${SchemaNames.crefia_deposit}.card_code AS card_code`,
          `${SchemaNames.crefia_deposit}.card_company AS card_company`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        if (type === ReportType.month) {
          query.andWhere(`DATE_FORMAT(${SchemaNames.crefia_deposit}.payment_date  , '${format[type]}') = :date` , {
            date : date,
          })
        } else {
          query.andWhere(`${SchemaNames.crefia_deposit}.payment_date = :date` , {
            date : date,
          })
        }
        
      return query.groupBy('card_code').getRawMany();
      
    } catch(e) {
      return null;
    }
  }
}