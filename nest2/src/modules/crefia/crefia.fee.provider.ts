import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaFee } from "src/entities/booster/crefia/crefia.fees.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { Repository } from "typeorm";

@Injectable()
export class CrefiaFeeProvider {
  constructor(
    @InjectRepository(CrefiaFee)
    private readonly feeRepo : Repository<CrefiaFee>
  ){}

  public async findByBizNo(business : UserBusiness) : Promise<Array<CrefiaFee>> {
    try {
      return await this.feeRepo.createQueryBuilder(SchemaNames.crefia_fees)
        .select([
          `${SchemaNames.crefia_fees}.card_name`,
          `${SchemaNames.crefia_fees}.member_group_id`,
        ])
        .where(`${SchemaNames.crefia_fees}.business = :business` , {
          business : business.id
        })
        .getMany()
    } catch(e) {
      console.log(e)
      return null;
    }
  }
}