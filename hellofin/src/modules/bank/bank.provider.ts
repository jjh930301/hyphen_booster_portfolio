import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { BusinessBank } from "src/entities/booster/user/business.bank.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { InsertResult, QueryRunner, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { OnedayResultDto } from "../user/dto/oneday.result.dto";

@Injectable()
export class BankProvider {
  constructor(
    @InjectRepository(BusinessBank)
    private readonly bankRepo : Repository<BusinessBank>
  ){}

  public async findByBizAndKey(
    businessId : string , 
    key : string | null = null,
    value : any | null = null,
  ) : Promise<BusinessBank | Array<BusinessBank>> {
    try {
      const query = this.bankRepo.createQueryBuilder(SchemaNames.business_bank)
        .select([
          `${SchemaNames.business_bank}.id as id`,
          `${SchemaNames.business_bank}.account as account`,
          `${SchemaNames.business_bank}.account_name as account_name`,
          `${SchemaNames.business_bank}.account_password as account_password`,
          `${SchemaNames.business_bank}.type as type`,
          `${SchemaNames.business_bank}.bank_type as bank_type`,
          `${SchemaNames.business_bank}.cert_number as cert_number`,
          `${SchemaNames.business_bank}.cert as cert`,
          `${SchemaNames.business_bank}.pri as pri`,
          `${SchemaNames.business_bank}.cert_password as cert_password`,
          `${SchemaNames.business_bank}.bank_id as bank_id`,
          `${SchemaNames.business_bank}.bank_password as bank_password`,
          `${SchemaNames.business_bank}.is_paid as is_paid`,
        ])
        .where(`${SchemaNames.business_bank}.business = :businessId` , {businessId})
      if (key) {
        query.andWhere(`${SchemaNames.business_bank}.${key} = :value` , {value})
        return await query.getRawOne();
      }
        
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async createBank(
    obj : QueryDeepPartialEntity<BusinessBank>,
    queryRunner : QueryRunner | null = null
  ) : Promise<InsertResult> {
    try {
      return await this.bankRepo.createQueryBuilder(SchemaNames.business_bank , queryRunner)
        .insert()
        .into(BusinessBank)
        .values(obj)
        .execute();
    } catch(e) {
      console.log(e)
      return null;
    }
  }
}