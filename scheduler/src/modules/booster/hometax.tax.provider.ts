import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { HometaxTax } from "src/entities/booster/hometax/hometax.tax.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ReportType } from "src/enums/user/report/report.type";
import { Repository } from "typeorm";

@Injectable()
export class HometaxTaxProvider {
  constructor(
    @InjectRepository(HometaxTax)
    private readonly hometaxRepo : Repository<HometaxTax>
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
      return await this.hometaxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .select([
          `SUM(${SchemaNames.hometax_taxes}.total_amount) AS total`,
          `DATE_FORMAT(${SchemaNames.hometax_taxes}.make_date , '${format[type]}') AS date`,
        ])
        .where(`${SchemaNames.hometax_taxes}.business = :business` , {
          business : business.id
        })
        .andWhere(`${SchemaNames.hometax_taxes}.make_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.hometax_taxes}.division = :div` , {
          div : 1
        })
        .groupBy('date')
        .orderBy('make_date' , 'DESC')
        .getRawMany();
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
      return await this.hometaxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .select([
          `SUM(${SchemaNames.hometax_taxes}.total_amount) AS total`,
          `DATE_FORMAT(${SchemaNames.hometax_taxes}.make_date , '${format[type]}') AS date`,
        ])
        .where(`${SchemaNames.hometax_taxes}.business = :business` , {
          business : business.id
        })
        .andWhere(`${SchemaNames.hometax_taxes}.make_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.hometax_taxes}.division = :div` , {
          div : 1
        })
        .groupBy('date')
        .getRawOne();
    } catch(e) {
      console.log(e)
      return null;
    }
  }
}