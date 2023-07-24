import { InjectRepository } from "@nestjs/typeorm";
import { HometaxCashPurchase } from "src/entities/booster/hometax/hometax.cash.purchase.entity";
import { HometaxCashSales } from "src/entities/booster/hometax/hometax.cash.sales.entity";
import { HometaxTax } from "src/entities/booster/hometax/hometax.tax.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class HometaxProvider {
  static models = [
    HometaxCashSales,
    HometaxCashPurchase,
    HometaxTax
  ]

  constructor(
    @InjectRepository(HometaxCashPurchase)
    private readonly hometaxCashPurchaseRepo : Repository<HometaxCashPurchase>,
    @InjectRepository(HometaxCashSales)
    private readonly hometaxCashSalesRepo : Repository<HometaxCashSales>,
    @InjectRepository(HometaxTax)
    private readonly hometaxRepo : Repository<HometaxTax>
  ){}

  public async cashSalesUpsert(
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
      await this.hometaxCashSalesRepo.createQueryBuilder()
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

  public async cashPurchaseUpsert(
    business : UserBusiness,
    data : any,
  ) : Promise<void> {
    try {
      const obj : QueryDeepPartialEntity<HometaxCashPurchase> = {
        business : business,
        trade_date : `${parseDashDate(data['trDt'])} ${parseColonTime(data['trTm'])}`,
        use_store : data['useStore'],
        store_no : data['storeNo'],
        supply_amount : Number(data['supAmt']) ? Number(data['supAmt']) : 0,
        tax_amount : Number(data['taxAmt']) ? Number(data['taxAmt']) : 0,
        tip : Number(data['tip']) ? Number(data['tip']) : 0,
        total_amount : Number(data['totAmt']) ? Number(data['totAmt']) : 0,
        approval_no : data['apprNo'],
        issue_no : data['frPartNo'],
        trade_division : data['trGb'],
        trade_type : data['trGb'] === '승인거래' 
        ? 1 
        : data['trGb'] === '취소거래'
        ? 2 
        : 0,
        deduction_division : data['ddcYn'],
        business_division : data['bmanClNm'],
        sector_code : data['tfbCd'],
        sector_name : data['tfbNm'],
        issue_division : data['cshptTrsTypeCd'],
        publication_category : data['cshptTrsTypeNm'],
        road_address : data['roadAdr'],
        area_address : data['ldAdr'],

      }
      await this.hometaxCashPurchaseRepo.createQueryBuilder()
        .insert()
        .into(HometaxCashPurchase)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'business',
            'trade_date',
            'approval_no'
          ],
          overwrite : [
            'use_store',
            'store_no',
            'supply_amount',
            'tax_amount',
            'tip',
            'total_amount',
            'issue_no',
            'trade_division',
            'trade_type',
            'deduction_division',
            'business_division',
            'sector_code',
            'sector_name',
            'issue_division',
            'publication_category',
            'road_address',
            'area_address',
          ]
        })
        .execute();
    } catch(e) {
      console.log(e);
    }
  }

  public async taxUpsert(
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

      await this.hometaxRepo.createQueryBuilder()
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
      console.log(e);
    }
  }
}