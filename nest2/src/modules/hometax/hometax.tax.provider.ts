import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { HometaxTax } from "src/entities/booster/hometax/hometax.tax.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ReportType } from "src/enums/user/report/report.type";
import { parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class HometaxTaxProvider {
  static models = [
    HometaxTax
  ]
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
        .getRawOne();
    } catch(e) {
      console.log(e)
      return null;
    }
  }

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