import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { HometaxCashSales } from "src/entities/booster/hometax/hometax.cash.sales.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class HometaxCashSalesProvider {
  constructor(
    @InjectRepository(HometaxCashSales)
    private readonly hometaxCashRepo : Repository<HometaxCashSales>,
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
}