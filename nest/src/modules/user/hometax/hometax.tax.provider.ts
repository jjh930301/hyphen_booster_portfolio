import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { HometaxTax } from "src/entities/booster/hometax/hometax.tax.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ReportType } from "src/enums/user/report/report.type";
import { StatisticsSelectHelper } from "src/helpers/select/statistics.select.helper";
import { DateRangeDto } from "src/modules/main/dto/date.range.dto";
import { PaginationDto } from "src/modules/main/dto/pagination.dto";
import { TaxDateTypeDto } from "src/modules/main/tax/dto/tax.date.type.dto";
import { TaxTypeDto } from "src/modules/main/tax/dto/tax.type.dto";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class HometaxTaxProvider {
  static models = [
    HometaxTax
  ];

  constructor(
    @InjectRepository(HometaxTax)
    private readonly taxRepo : Repository<HometaxTax>
  ){}

  public async upsert(
    business : UserBusiness,
    data : any
  ) {
    try {
      const obj : QueryDeepPartialEntity<HometaxTax> = {
        business : business,
        division : Number(data['supByr']),
        make_date : data['makeDt'] !== '' ? parseDashDate(data['makeDt']) : null,
        issue_no : data['issueNo'],
        issue_display_no : data['issueNoDisp'],
        issue_date : data['issueDt'] !== '' ? parseDashDate(data['issueDt']) : null,
        send_date : data['sendDt'] !== '' ? parseDashDate(data['sendDt']) : null,
        supplier_business_no : data['supBizNo'],
        supplier_sub_business_no : data['supBizSubNo'],
        supplier_company_name : data['supCorpNm'],
        supplier_ceo_name : data['supRepNm'],
        supplier_address : data['supAddress'],
        buyer_business_no : data['byrBizNo'],
        buyer_sub_business_no : data['byrBizSubNo'],
        buyer_company_name : data['byrCorpNm'],
        buyer_ceo_name : data['byrRepNm'],
        buyer_address : data['byrAddress'],
        total_amount : Number(data['totAmt']) ? Number(data['totAmt']) : 0,
        supply_amount : Number(data['supAmt']) ? Number(data['supAmt']) : 0,
        tax_amount : Number(data['taxAmt']) ? Number(data['taxAmt']) : 0,
        tax_classification : data['taxClsf'],
        tax_kind : data['taxKnd'],
        issue_type : data['isnType'],
        note : data['bigo'],
        receipt_division : data['demandGb'],
        supplier_email : data['supEmail'],
        buyer_first_email : data['byrEmail1'],
        buyer_second_email : data['byrEmail2'],
        item_date : data['itemDt'] !== '' ? parseDashDate(data['itemDt']) : null,
        item_name : data['itemNm'],
        item_standard : data['itemStd'],
        item_quantity : Number(data['itemQty']) ? Number(data['itemQty']) : 0,
        item_price : Number(data['itemUnt']) ? Number(data['itemUnt']) : 0,
        item_supply_amount : Number(data['itemSupAmt']) ? Number(data['itemSupAmt']) : 0,
        item_tax_amount : Number(data['itemTaxAmt']) ? Number(data['itemTaxAmt']) : 0,
        item_note : data['itemBigo'],
      };

      await this.taxRepo.createQueryBuilder()
        .insert()
        .into(HometaxTax)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'business',
            'division',
            'make_date',
            'issue_no',
            'issue_display_no',
            'issue_date',
            'send_date',
          ],
          overwrite : [
            'supplier_business_no',
            'supplier_sub_business_no',
            'supplier_company_name',
            'supplier_ceo_name',
            'supplier_address',
            'buyer_business_no',
            'buyer_sub_business_no',
            'buyer_company_name',
            'buyer_ceo_name',
            'buyer_address',
            'total_amount',
            'supply_amount',
            'tax_amount',
            'tax_classification',
            'tax_kind',
            'issue_type',
            'note',
            'receipt_division',
            'supplier_email',
            'buyer_first_email',
            'buyer_second_email',
            'item_date',
            'item_name',
            'item_standard',
            'item_quantity',
            'item_price',
            'item_supply_amount',
            'item_tax_amount',
            'item_note',
          ]
        })
        .execute();
    } catch(e) {
    }
  }

  public async dateStatistics(
    business : UserBusiness,
    type : number,
    startDate : string,
    endDate : string,
  ) {
    try {
      return await this.taxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .select(StatisticsSelectHelper.taxSalesDate(SchemaNames.hometax_taxes , type))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        //공급일 기준
        .andWhere(`${SchemaNames.hometax_taxes}.make_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.hometax_taxes}.division = :div`, {
          div : 1
        })
        .groupBy('date')
        .orderBy('date' , 'ASC')
        .getRawMany();
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
      return await this.taxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .select(StatisticsSelectHelper.taxSalesDayOrTime(SchemaNames.hometax_taxes , 0))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        //공급일 기준
        .andWhere(`${SchemaNames.hometax_taxes}.make_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.hometax_taxes}.division = :div`, {
          div : 1
        })
        .groupBy('time')
        .orderBy('time' , 'ASC')
        .getRawMany();
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
      return await this.taxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .select(StatisticsSelectHelper.taxSalesDayOrTime(SchemaNames.hometax_taxes , 1))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        //공급일 기준
        .andWhere(`${SchemaNames.hometax_taxes}.make_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.hometax_taxes}.division = :div`, {
          div : 1
        })
        .groupBy('day')
        .orderBy('day' , 'ASC')
        .getRawMany();
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
      return await this.taxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .select([
          `DATE_FORMAT(${SchemaNames.hometax_taxes}.make_date , '%Y%m%d') AS makeDt `,
          `SUM(${SchemaNames.hometax_taxes}.total_amount) AS totAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        //공급일 기준
        .andWhere(`${SchemaNames.hometax_taxes}.make_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.hometax_taxes}.division = :div`, {
          div : 1
        })
        .groupBy('makeDt')
        .orderBy('makeDt' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async dateSum(
    business : UserBusiness,
    startDate : string,
    endDate : string,
  ) {
    try {
      const query = this.taxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .select([
          `SUM(${SchemaNames.hometax_taxes}.total_amount) AS totAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        //공급일 기준
        .andWhere(`${SchemaNames.hometax_taxes}.make_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        query.andWhere(`${SchemaNames.hometax_taxes}.division = :type` , {
          type : 1
        });
      const data = await query.getRawOne()
      return await data['totAmt']
    } catch(e) {
      return null
    }
  }

  public async taxDate(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    type : number
  ) : Promise<HometaxTax[]> {
    try {
      //(수정) 매입 - , 매출 +
      const query = this.taxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .select([
          `DATE_FORMAT(${SchemaNames.hometax_taxes}.make_date , '%Y%m%d') AS makeDt `,
          `SUM(${SchemaNames.hometax_taxes}.total_amount) AS totAmt`,
          `SUM(${SchemaNames.hometax_taxes}.supply_amount) AS supAmt`,
          `SUM(${SchemaNames.hometax_taxes}.tax_amount) AS taxAmt`,
          type === 1 || type === 2 ? 
          `COUNT(
            IF(
              ${SchemaNames.hometax_taxes}.division = ${type}, 
              ${SchemaNames.hometax_taxes}.division, 
              null
            )
          ) AS count` : 
          `COUNT(${SchemaNames.hometax_taxes}.division) AS count`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        //공급일 기준
        .andWhere(`${SchemaNames.hometax_taxes}.make_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if(type !== 0) {
        query.andWhere(`${SchemaNames.hometax_taxes}.division = :type` , {
          type : type ? type : 1
        });
      }
      return await query.groupBy('makeDt').orderBy('makeDt' , 'ASC').getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async taxList(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    type : TaxTypeDto,
    dateType : TaxDateTypeDto,
    page : PaginationDto,
    word : string | null = null
  ) : Promise<HometaxTax[]> {
    const date = {
      1 : 'make_date',
      2 : 'issue_date'
    };
    try {
      const flag = date[dateType.date_type] ? date[dateType.date_type] : date[1];
      const query = this.taxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .select([
          `${SchemaNames.hometax_taxes}.issue_display_no AS issueNoDisp`,
          `DATE_FORMAT(${SchemaNames.hometax_taxes}.make_date , '%Y-%m-%d') AS makeDt `, // 공급일
          `DATE_FORMAT(${SchemaNames.hometax_taxes}.issue_date , '%Y-%m-%d') AS issueDt `, // 발급일
          `DATE_FORMAT(${SchemaNames.hometax_taxes}.send_date , '%Y-%m-%d') AS sendDt `, // 전송일
          `${SchemaNames.hometax_taxes}.division AS division`, // 1 : 매출 , 2 : 매입
          `${SchemaNames.hometax_taxes}.item_name AS itemName`, // 품목명
          `(CASE
            WHEN ${SchemaNames.hometax_taxes}.division = 2 
            THEN ${SchemaNames.hometax_taxes}.supplier_company_name 
            WHEN ${SchemaNames.hometax_taxes}.division = 1 
            THEN ${SchemaNames.hometax_taxes}.buyer_company_name 
          ELSE ${SchemaNames.hometax_taxes}.supplier_company_name END) AS company`, // 거래처명
          `(CASE
            WHEN ${SchemaNames.hometax_taxes}.division = 2 
            THEN ${SchemaNames.hometax_taxes}.supplier_business_no 
            WHEN ${SchemaNames.hometax_taxes}.division = 1 
            THEN ${SchemaNames.hometax_taxes}.buyer_business_no 
          ELSE ${SchemaNames.hometax_taxes}.supplier_business_no END) AS businessNo`, // 거래처 사업자번호
          `(CASE
            WHEN ${SchemaNames.hometax_taxes}.division = 2 
            THEN ${SchemaNames.hometax_taxes}.supplier_ceo_name 
            WHEN ${SchemaNames.hometax_taxes}.division = 1 
            THEN ${SchemaNames.hometax_taxes}.buyer_ceo_name 
          ELSE ${SchemaNames.hometax_taxes}.supplier_ceo_name END) AS ceo`, // 거래처 대표자명
          `${SchemaNames.hometax_taxes}.supply_amount AS supAmt `,
          `${SchemaNames.hometax_taxes}.tax_amount AS taxAmt `,
          `${SchemaNames.hometax_taxes}.total_amount AS totAmt `,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
      if(startDate && endDate) {
        query.andWhere(`${SchemaNames.hometax_taxes}.${flag} BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      }
      if(word !== null) {
        const like = {
          // 0 : 전체 검색에서는 공급자 , 구매자에서 검색
          0 : `(${SchemaNames.hometax_taxes}.buyer_company_name LIKE :word OR ${SchemaNames.hometax_taxes}.supplier_company_name LIKE :word )`,
          // 1 : 매출에서는 구매자
          1 : `${SchemaNames.hometax_taxes}.buyer_company_name LIKE :word`,
          // 2 : 매입에서는 공급자
          2 : `${SchemaNames.hometax_taxes}.supplier_company_name LIKE :word `,
        }
        query.andWhere(`${like[type.type] !== undefined ? like[type.type] : 1}` , {word : `%${word}%`})
      }
      if(type?.type !== 0) {
        query.andWhere(`${SchemaNames.hometax_taxes}.division = :type` , {
          type : type?.type ? type.type : 1
        });
      }
      return await query
        .orderBy(`${flag}` , 'DESC')
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async rangeSum(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    type : TaxTypeDto,
    dateType : TaxDateTypeDto,
    page : PaginationDto,
    word : string | null = null
  ) {
    const date = {
      1 : 'make_date',
      2 : 'issue_date'
    };
    try {
      const flag = date[dateType.date_type] ? date[dateType.date_type] : date[1];
      const query = this.taxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .select([
          `SUM(${SchemaNames.hometax_taxes}.total_amount) AS total`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
      if(startDate && endDate) {
        query.andWhere(`${SchemaNames.hometax_taxes}.${flag} BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      }
      if(word !== null) {
        const like = {
          // 0 : 전체 검색에서는 공급자 , 구매자에서 검색
          0 : `(${SchemaNames.hometax_taxes}.buyer_company_name LIKE :word OR ${SchemaNames.hometax_taxes}.supplier_company_name LIKE :word )`,
          // 1 : 매출에서는 구매자
          1 : `${SchemaNames.hometax_taxes}.buyer_company_name LIKE :word`,
          // 2 : 매입에서는 공급자
          2 : `${SchemaNames.hometax_taxes}.supplier_company_name LIKE :word `,
        }
        query.andWhere(`${like[type.type] !== undefined ? like[type.type] : 1}` , {word : `%${word}%`})
      }
      if(type?.type !== 0) {
        query.andWhere(`${SchemaNames.hometax_taxes}.division = :type` , {
          type : type?.type ? type.type : 1
        });
      }
      const result = await query.getRawMany();
      return result[0]['total']
    } catch(e) {
      return null;
    }
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
      return await this.taxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .select([
          `SUM(${SchemaNames.hometax_taxes}.total_amount) AS total`,
          `DATE_FORMAT(${SchemaNames.hometax_taxes}.make_date , '${format[type]}') AS date`,
        ])
        .where(`${SchemaNames.hometax_taxes}.business = :business` , {
          business : business
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
      return await this.taxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
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
  // type : 1 매출 , 2 매입
  public async findRecentOne(business : UserBusiness , type : number) : Promise<HometaxTax> {
    try {
      return await this.taxRepo.createQueryBuilder(SchemaNames.hometax_taxes)
        .where(`${SchemaNames.hometax_taxes}.business = :business` , {
          business : business.id
        })
        .where(`${SchemaNames.hometax_taxes}.division = :type` , {
          type : type
        })
        .orderBy('make_date' , 'DESC')
        .limit(1)
        .getOne()
    } catch(e) {  
      return null;
    }
  }
}