import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { HometaxCashSales } from "src/entities/booster/hometax/hometax.cash.sales.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ReportType } from "src/enums/user/report/report.type";
import { Repository } from "typeorm";

@Injectable()
export class HometaxCashSalesProvider {
  constructor(
    @InjectRepository(HometaxCashSales)
    private readonly hometaxCashSalesRepo : Repository<HometaxCashSales>,
  ){}  

  public async salesSum(
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
      return await this.hometaxCashSalesRepo.createQueryBuilder(SchemaNames
        .hometax_cash_sales)
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
        .andWhere(`${SchemaNames.hometax_cash_sales}.trade_type = :div` , {
          div : 1
        })
        .groupBy('date')
        .orderBy('trade_date' , 'DESC')
        .getRawMany()
    } catch(e) {
      console.log(e)
      return null;
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
      return await this.hometaxCashSalesRepo.createQueryBuilder(SchemaNames.hometax_cash_sales)
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
}