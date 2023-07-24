import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { HometaxCashSales } from "src/entities/booster/hometax/hometax.cash.sales.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ReportType } from "src/enums/user/report/report.type";
import { StatisticsSelectHelper } from "src/helpers/select/statistics.select.helper";
import { PaginationDto } from "src/modules/main/dto/pagination.dto";
import { TypeDto } from "src/modules/main/dto/type.dto";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class HometaxCashSalesProvider {
  static models = [
    HometaxCashSales
  ];

  constructor(
    @InjectRepository(HometaxCashSales)
    private readonly hometaxCashRepo : Repository<HometaxCashSales>,
    @InjectRepository(UserBusiness)
    private readonly bizRepo : Repository<UserBusiness>
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
      await this.hometaxCashRepo.createQueryBuilder()
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

  public async dateStatistics(
    business : UserBusiness,
    type : number,
    startDate : string,
    endDate : string,
  ) {
    try {
      const query =  this.hometaxCashRepo.createQueryBuilder(SchemaNames.hometax_cash_sales)
        .select(StatisticsSelectHelper.cashSalesDate(SchemaNames.hometax_cash_sales,type))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.hometax_cash_sales}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy('date')
        .orderBy('date' , 'ASC')

      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async timeStatistics(
    business : UserBusiness,
    startDate : string,
    endDate : string,
  ) {
    try {
      const query =  this.hometaxCashRepo.createQueryBuilder(SchemaNames.hometax_cash_sales)
        .select(StatisticsSelectHelper.cashSalesDayOrTime(SchemaNames.hometax_cash_sales , 0))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.hometax_cash_sales}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy('time')
        .orderBy('time' , 'ASC')

      return await query.getRawMany()
    } catch(e) {
      return null;
    }
  }

  public async dayStatistics(
    business : UserBusiness,
    startDate : string,
    endDate : string,
  ) {
    try {
      const query =  this.hometaxCashRepo.createQueryBuilder(SchemaNames.hometax_cash_sales)
        .select(StatisticsSelectHelper.cashSalesDayOrTime(SchemaNames.hometax_cash_sales , 1))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.hometax_cash_sales}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy('day')
        .orderBy('day' , 'ASC')

      return await query.getRawMany()
    } catch(e) {
      return null;
    }
  }

  public async calendar(
    business : UserBusiness,
    startDate : string,
    endDate : string,
  ) {
    try {
      return await this.hometaxCashRepo.createQueryBuilder(SchemaNames.hometax_cash_sales)
        .select([
          `DATE_FORMAT(${SchemaNames.hometax_cash_sales}.trade_date , '%Y%m%d') AS trDt `,
          `SUM(
            CASE
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 1
              THEN ${SchemaNames.hometax_cash_sales}.tip + ${SchemaNames.hometax_cash_sales}.tax_amount + ${SchemaNames.hometax_cash_sales}.supply_amount
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 2
              THEN -${SchemaNames.hometax_cash_sales}.tip - ${SchemaNames.hometax_cash_sales}.tax_amount - ${SchemaNames.hometax_cash_sales}.supply_amount
            ELSE 0 END
          ) AS totAmt`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.hometax_cash_sales}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy('trDt')
        .orderBy('trDt' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async dateSum(
    business : UserBusiness,
    startDate : string,
    endDate : string
  ) {
    try {
      const query = this.hometaxCashRepo.createQueryBuilder(SchemaNames.hometax_cash_sales)
        .select([
          `SUM(${SchemaNames.hometax_cash_sales}.tip + ${SchemaNames.hometax_cash_sales}.tax_amount + ${SchemaNames.hometax_cash_sales}.supply_amount) AS totAmt`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.hometax_cash_sales}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.hometax_cash_sales}.trade_type = :type` , {
          type : 1
        })
      const data = await query.getRawOne()
      return await data['totAmt']
    } catch(e) {
      return null
    }
  }

  public async cashDate(
    business : UserBusiness,
    startDate : string,
    endDate : string
  ) : Promise<HometaxCashSales[]> {
    try {
      const query = this.hometaxCashRepo.createQueryBuilder(SchemaNames.hometax_cash_sales)
        .select([
          `DATE_FORMAT(${SchemaNames.hometax_cash_sales}.trade_date , '%Y%m%d') AS trDt `,
          `SUM(
            CASE
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 1 
              THEN ${SchemaNames.hometax_cash_sales}.supply_amount 
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 2 
              THEN -${SchemaNames.hometax_cash_sales}.supply_amount 
            ELSE 0 END
          ) AS supAmt`,
          `COUNT(${SchemaNames.hometax_cash_sales}.supply_amount) AS supCnt`,
          `SUM(
            CASE
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 1 
              THEN ${SchemaNames.hometax_cash_sales}.tax_amount 
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 2 
              THEN -${SchemaNames.hometax_cash_sales}.tax_amount 
            ELSE 0 END
          ) AS taxAmt`,
          `COUNT(${SchemaNames.hometax_cash_sales}.tax_amount) AS taxCnt`,
          `SUM(
            CASE
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 1 
              THEN ${SchemaNames.hometax_cash_sales}.tip 
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 2 
              THEN -${SchemaNames.hometax_cash_sales}.tip 
            ELSE 0 END
          ) AS tipAmt`,
          `COUNT(${SchemaNames.hometax_cash_sales}.tip) AS tip`,
          `SUM(
            CASE
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 1 
              THEN ${SchemaNames.hometax_cash_sales}.tip + ${SchemaNames.hometax_cash_sales}.tax_amount + ${SchemaNames.hometax_cash_sales}.supply_amount 
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 2 
              THEN -${SchemaNames.hometax_cash_sales}.tip -${SchemaNames.hometax_cash_sales}.tax_amount -${SchemaNames.hometax_cash_sales}.supply_amount 
            ELSE 0 END
          ) AS totAmt`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.hometax_cash_sales}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      return await query.groupBy('trDt').orderBy('trDt' , 'ASC').getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async cashList(
    busienss : UserBusiness,
    startDate : string,
    endDate : string,
    page : PaginationDto,
    type : TypeDto,
    word : string | null = null
  ) {
    try {
      const query = this.hometaxCashRepo.createQueryBuilder(SchemaNames.hometax_cash_sales)
        .select([
          `trade_date AS trDt`,
          `issue_division AS issueGb`,
          `supply_amount AS supAmt`,
          `tax_amount AS taxAmt`,
          `tip AS tip`,
          `(supply_amount + tax_amount + tip) AS totAmt`,
          `approval_no AS apprNo`,
          `issue_no AS frPartNo`,
          `trade_division AS trGb`,
          `note AS cshptTrsTypeNm`,
          `origin_trade_date AS originTrDt`
        ])
        .leftJoin(`${SchemaNames.hometax_cash_sales}.business` , 'business')
        .where(`business.business_number = :bizNo` , {
          bizNo : busienss.business_number
        })
      if(startDate != null && endDate != null) {
        query.andWhere(`${SchemaNames.hometax_cash_sales}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      if(word) {
        if(word != null && typeof(Number(word)) === 'number') {
          const like = `
            (${SchemaNames.hometax_cash_sales}.supply_amount + ${SchemaNames.hometax_cash_sales}.tax_amount + ${SchemaNames.hometax_cash_sales}.tip) LIKE :word 
            OR ${SchemaNames.hometax_cash_sales}.approval_no LIKE :word 
          `
          query.andWhere(`(${like})` , {word : `%${word}%`})
        }
      }
      if(type?.type) {
        query.andWhere(`${SchemaNames.hometax_cash_sales}.trade_type = :type` , {
          type : type.type
        })
      }
      
      return await query
        .orderBy('trDt' , 'DESC')
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
        .getRawMany();
    } catch(e) {
      console.log(e);
      return [];
    }
  }

  public async rangeSum(
    busienss : UserBusiness,
    startDate : string,
    endDate : string,
    type : TypeDto,
    word : string | null = null
  ) {
    try {
      const query = this.hometaxCashRepo.createQueryBuilder(SchemaNames.hometax_cash_sales)
        .select([
          `SUM(
            CASE
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 1 
              THEN ${SchemaNames.hometax_cash_sales}.tip + ${SchemaNames.hometax_cash_sales}.tax_amount + ${SchemaNames.hometax_cash_sales}.supply_amount
              WHEN ${SchemaNames.hometax_cash_sales}.trade_type = 2 
              THEN -${SchemaNames.hometax_cash_sales}.tip -${SchemaNames.hometax_cash_sales}.tax_amount -${SchemaNames.hometax_cash_sales}.supply_amount
            ELSE 0 END
          ) AS total`,
        ])
        .leftJoin(`${SchemaNames.hometax_cash_sales}.business` , 'business')
        .where(`business.business_number = :bizNo` , {
          bizNo : busienss.business_number
        })
      if(startDate != null && endDate != null) {
        query.andWhere(`${SchemaNames.hometax_cash_sales}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      if(word) {
        if(word != null && typeof(Number(word)) === 'number') {
          const like = `
            (${SchemaNames.hometax_cash_sales}.supply_amount + ${SchemaNames.hometax_cash_sales}.tax_amount + ${SchemaNames.hometax_cash_sales}.tip) LIKE :word 
            OR ${SchemaNames.hometax_cash_sales}.approval_no LIKE :word 
          `
          query.andWhere(`(${like})` , {word : `%${word}%`})
        }
      }
      if(type?.type) {
        query.andWhere(`${SchemaNames.hometax_cash_sales}.trade_type = :type` , {
          type : type.type
        })
      }
      const result = await query.getRawMany();
      return result[0]['total']
    } catch(e) {
      return null;
    }
  }

  public async changed() {
    const sales = await this.hometaxCashRepo.find();
    sales.forEach(async sale => {
      const business = await this.bizRepo.findOneBy({id : sale.business.id});
      const obj : QueryDeepPartialEntity<HometaxCashSales> = {
        business : business,
        trade_date : sale.trade_date,
        issue_division : sale.issue_division,
        supply_amount : sale.supply_amount,
        tax_amount : sale.tax_amount,
        tip : sale.tip,
        approval_no : sale.approval_no,
        issue_no : sale.issue_no,
        trade_division : sale.trade_division,
        trade_type : sale.trade_division === '승인거래' ? 1 : 2,
        note : sale.note,
      }
      await this.hometaxCashRepo.createQueryBuilder()
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
            'trade_type',
          ]
        })
        .execute();
    })
  }

  public async reportSalesSum(
    business : string,
    startDate : string ,
    endDate : string,
    type : number
  ) {
    try {
      const format = {
        [ReportType.day] : '%Y-%m-%d',
        [ReportType.month] : '%Y-%m'
      }
      return await this.hometaxCashRepo.createQueryBuilder(SchemaNames
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
          business : business
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
      return await this.hometaxCashRepo.createQueryBuilder(SchemaNames.hometax_cash_sales)
        .select([
          `SUM(${SchemaNames.hometax_cash_sales}.supply_amount) AS total`,
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

  public async findRecentOne(business : UserBusiness) : Promise<HometaxCashSales> {
    try {
      return await this.hometaxCashRepo.createQueryBuilder(SchemaNames.crefia_card)
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