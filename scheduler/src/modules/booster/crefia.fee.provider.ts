import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaFee } from "src/entities/booster/crefia/crefia.fee.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class CrefiaFeeProvider {

  static models = [
    CrefiaFee
  ]
  
  constructor(
    @InjectRepository(CrefiaFee)
    private readonly feeRepo : Repository<CrefiaFee>
  ){}

  // cardNm: '농협NH카드
  // merNo: '122640821
  // sinYongFeeRate: '1.25
  // checkFeeRateB: '
  // checkFeeRateC: '1
  // pymPeriod: '1 
  // cardCd: '19'
  public async insertFee(business : UserBusiness , data : Object) {
    try {
      const obj : QueryDeepPartialEntity<CrefiaFee> = {
        business : business.id as unknown as UserBusiness,
        card_name : data['cardNm'],
        member_group_id : data['merNo'],
        sinyong_fee_rate : data['sinYongFeeRate'] ? data['sinYongFeeRate'] : 0,
        check_fee_rate_b : data['checkFeeRateB'] ? data['checkFeeRateB'] : 0,
        check_fee_rate_c : data['checkFeeRateC'] ? data['checkFeeRateC'] : 0,
        payment_period : data['pymPeriod'] ? data['pymPeriod'] : 0,
        card_code : data['cardCd'],
      };
      this.feeRepo.createQueryBuilder(SchemaNames.crefia_fees)
        .insert()
        .into(CrefiaFee)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'business',
            'member_group_id'
          ],
          overwrite : [
            'card_name',
            'sinyong_fee_rate',
            'check_fee_rate_b',
            'check_fee_rate_c',
            'payment_period',
            'card_code',
          ]
        })
        .execute();
    } catch(e) {
      console.log(e);
    }
  }
}