import { Injectable } from '@nestjs/common';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { ServiceData } from 'src/models';
import { CrefiaFeeProvider } from './crefia.fee.provider';

@Injectable()
export class CrefiaService {
  constructor(
    private readonly feePvd : CrefiaFeeProvider
  ){}

  public async memberNumber(business : UserBusiness) : Promise<ServiceData>{
    try {
      const fees = await this.feePvd.findByBizNo(business);
      if(fees.length !== 0) {
        return ServiceData.ok(
          "Successfully getting crefia fees" , 
          {
            fee : fees
          },
          2101
        )
      }
      return ServiceData.ok("empty fees" , {fee : []} , 2102);
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }
}
