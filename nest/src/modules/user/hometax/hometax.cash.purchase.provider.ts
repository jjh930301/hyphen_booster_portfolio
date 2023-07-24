import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { HometaxCashPurchase } from "src/entities/booster/hometax/hometax.cash.purchase.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class HometaxCashPurchaseProvider {
  static models = [
    HometaxCashPurchase,
  ]

  constructor(
    @InjectRepository(HometaxCashPurchase)
    private readonly hometaxCashRepo : Repository<HometaxCashPurchase>,
    @InjectRepository(UserBusiness)
    private readonly bizRepo : Repository<UserBusiness>
  ){}

  public async upsert(
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
      await this.hometaxCashRepo.createQueryBuilder()
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

  public async changed() {
    const purchases = await this.hometaxCashRepo.find();
    purchases.forEach(async purchase => {
      const business = await this.bizRepo.findOneBy({id : purchase.business.id});
      const obj : QueryDeepPartialEntity<HometaxCashPurchase> = {
        business : business,
        trade_date : purchase.trade_date,
        use_store : purchase.use_store,
        store_no : purchase.store_no,
        supply_amount : purchase.supply_amount,
        tax_amount : purchase.tax_amount,
        tip : purchase.tip,
        total_amount : purchase.total_amount,
        approval_no : purchase.approval_no,
        issue_no : purchase.issue_no,
        trade_division : purchase.trade_division,
        trade_type : 1,
        deduction_division : purchase.deduction_division,
        business_division : purchase.business_division,
        sector_code : purchase.sector_code,
        sector_name : purchase.sector_name,
        issue_division : purchase.issue_division,
        publication_category : purchase.publication_category,
        road_address : purchase.road_address,
        area_address : purchase.area_address,
  
      }
      await this.hometaxCashRepo.createQueryBuilder()
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
            'trade_type',
          ]
        })
        .execute();
    })
  }

  public async findRecentOne(business : UserBusiness) : Promise<HometaxCashPurchase> {
    try {
      return await this.hometaxCashRepo.createQueryBuilder(SchemaNames.crefia_purchases)
        .where(`${SchemaNames.crefia_purchases}.business = :business` , {
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