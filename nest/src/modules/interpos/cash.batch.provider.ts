import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CashBatch } from "src/entities/interpos/cash.batch.entity";
import { Repository } from "typeorm";

@Injectable()
export class CashBatchProvider {
  static models = [
    CashBatch
  ]

  constructor(
    @InjectRepository(CashBatch)
    private readonly cashRepo : Repository<CashBatch>
  ){}

  public async cashDay(
    businessNumber : string,
		startDate : string,
		endDate : string,
    appr_yn : string,
  ) : Promise<CashBatch[]> {
    try {
      const query =  await this.cashRepo.createQueryBuilder(SchemaNames.cash_batch)
        .select([
          `DATE_FORMAT(${SchemaNames.cash_batch}.appr_date , '%Y%m%d') AS trDt`, //승인일자
          `SUM(
            CASE 
              WHEN ${SchemaNames.cash_batch}.appr_yn = 'N' 
              THEN -${SchemaNames.cash_batch}.total_amount 
              WHEN ${SchemaNames.cash_batch}.appr_yn = 'Y' 
              THEN ${SchemaNames.cash_batch}.total_amount
            ELSE 0 END) AS trSumAmt`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.cash_batch}.appr_yn = 'N' 
              THEN -${SchemaNames.cash_batch}.sales_amount 
              WHEN ${SchemaNames.cash_batch}.appr_yn = 'Y' 
              THEN ${SchemaNames.cash_batch}.sales_amount
            ELSE 0 END) AS trApprSumAmt`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.cash_batch}.appr_yn = 'N' 
              THEN ${SchemaNames.cash_batch}.tax 
              WHEN ${SchemaNames.cash_batch}.appr_yn = 'Y' 
              THEN ${SchemaNames.cash_batch}.tax
            ELSE 0 END) AS trSumTax`,
        ])
        .where(`${SchemaNames.cash_batch}.biz_no = :biz_no` , {
          biz_no : businessNumber
        })
        .andWhere(`${SchemaNames.cash_batch}.appr_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      
      if(appr_yn === "Y" || appr_yn === "N") {
        query.andWhere(`${SchemaNames.cash_batch}.appr_yn = :yn` , {
          yn : appr_yn
        })
      }
      return query
        .groupBy('trDt')
        .orderBy('trDt' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async cashDetailDay(
    businessNumber : string,
		startDate : string,
		endDate : string,
    appr_yn : string,
    word : string
  ) : Promise<CashBatch[]> {
    try {
      const query =  await this.cashRepo.createQueryBuilder(SchemaNames.cash_batch)
        .select([
          `DATE_FORMAT(${SchemaNames.cash_batch}.appr_date , '%Y%m%d') AS trDt`, //승인일자
					`DATE_FORMAT(${SchemaNames.cash_batch}.appr_time , '%h%i%s') AS trTm`, //승인시간
          `${SchemaNames.cash_batch}.appr_yn as apprYN`,
          `${SchemaNames.cash_batch}.sales_amount as apprAmt`,
          `${SchemaNames.cash_batch}.appr_no as apprNo`,
          `${SchemaNames.cash_batch}.total_amount as totalAmt`,
          `${SchemaNames.cash_batch}.tax as tax`,
        ])
        .where(`${SchemaNames.cash_batch}.biz_no = :biz_no` , {
          biz_no : businessNumber
        })
        .andWhere(`${SchemaNames.cash_batch}.appr_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if (word !== "" && word) {
        query.andWhere(
          `CONCAT(${SchemaNames.cash_batch}.appr_no , ${SchemaNames.cash_batch}.sales_amount) LIKE :word` , {
          word : `%${word}%`
        })
      }
      if(appr_yn === "Y" || appr_yn === "N") {
        query.andWhere(`${SchemaNames.cash_batch}.appr_yn = :yn` , {
          yn : appr_yn
        })
      }
      return query
        .orderBy('trDt' , 'ASC')
        .getRawMany()
    } catch(e) {
      return null;
    }
  }
}