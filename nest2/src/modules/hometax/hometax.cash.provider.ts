import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { HometaxCashSales } from "src/entities/booster/hometax/hometax.cash.sales.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ReportType } from "src/enums/user/report/report.type";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class HometaxCashProvider {
  static models = [
    HometaxCashSales
  ]
  constructor(
    @InjectRepository(HometaxCashSales)
    private readonly cashRepo : Repository<HometaxCashSales>
  ){}

  public async upsert(
    business : UserBusiness,
    data : any
  ) : Promise<void> {
    try {
      const obj : QueryDeepPartialEntity<HometaxCashSales> = {
        business : business,
        trade_date : `${parseDashDate(data['trDt'])} ${parseColonTime(data['trTm'])}`,
        issue_division : data['issueGb'],
        supply_amount : Number(data['supAmt']) ? Number(data['supAmt']) : 0,
        tax_amount : Number(data['taxAmt']) ? Number(data['taxAmt']) : 0,
        tip : Number(data['tip']) ? Number(data['tip']) : 0,
        approval_no : data['apprNo'],
        issue_no : data['frPartNo'],
        trade_division : data['trGb'],
        trade_type : data['trGb'] === '승인거래' ? 1 : 2,
        note : data['cshptTrsTypeNm'],
      }
      await this.cashRepo.createQueryBuilder()
        .insert()
        .into(HometaxCashSales)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'business',
            'trade_date',
            'approval_no'
          ],
          overwrite : [
            'issue_division',
            'supply_amount',
            'tax_amount',
            'tip',
            'issue_no',
            'trade_division',
            'trade_type',
            'note',
          ]
        })
        .execute();
    } catch(e) {
      console.log(e);
    }
  }

  public async kakaoSum(
    business : UserBusiness,
    startDate : string ,
    endDate : string,
    type : number
  ) {
    try {
      const format = {
        [ReportType.day] : '%Y-%m-%d',
        [ReportType.month] : '%Y-%m'
      }
      return await this.cashRepo.createQueryBuilder(SchemaNames.hometax_cash_sales)
        .select([
          `SUM(
            CASE
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 1
              THEN ${SchemaNames.hometax_cash_sales}.tip + ${SchemaNames.hometax_cash_sales}.tax_amount + ${SchemaNames.hometax_cash_sales}.supply_amount
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 2
              THEN -${SchemaNames.hometax_cash_sales}.tip - ${SchemaNames.hometax_cash_sales}.tax_amount - ${SchemaNames.hometax_cash_sales}.supply_amount
            ELSE 0 END
          ) AS total`,
          `DATE_FORMAT(${SchemaNames.hometax_cash_sales}.trade_date , '${format[type]}') AS date`,
        ])
        .where(`${SchemaNames.hometax_cash_sales}.business = :business` , {
          business : business.id
        })
        .andWhere(`${SchemaNames.hometax_cash_sales}.trade_date BETWEEN :start_date AND :end_date` , {
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

  public async findRecentOne(business : UserBusiness) : Promise<HometaxCashSales> {
    try {
      return await this.cashRepo.createQueryBuilder(SchemaNames.crefia_card)
        .where(`${SchemaNames.hometax_cash_sales}.business = :business` , {
          business : business.id
        })
        .orderBy('trade_date' , 'DESC')
        .limit(1)
        .getOne()
    } catch(e) {  
      return null;
    }
  }
}