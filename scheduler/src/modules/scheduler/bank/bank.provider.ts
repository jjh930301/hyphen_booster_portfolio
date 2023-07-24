import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { BusinessBank } from "src/entities/booster/user/business.bank.entity";
import { Repository, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class BankProvider {
  constructor(
    @InjectRepository(BusinessBank)
    private readonly bankRepo : Repository<BusinessBank>
  ){}

  public async findBank() : Promise<Array<BusinessBank>> {
    try {
      return await this.bankRepo.createQueryBuilder()
        .select([
          `${SchemaNames.business_bank}.cert`,
          `${SchemaNames.business_bank}.pri`,
          `${SchemaNames.business_bank}.cert_password`,
          `${SchemaNames.business_bank}.bank_id`,
          `${SchemaNames.business_bank}.bank_password`,
          `${SchemaNames.business_bank}.account`,
          `${SchemaNames.business_bank}.account_password`,
        ])
        .where(`${SchemaNames.business_bank}.cert is not null`)
        .orWhere(`${SchemaNames.business_bank}.bank_id is not null`)
        .getMany();
    } catch(e) {
      console.log(e);
      return []
    }
  }

  public async updateBankInfo(
    values : QueryDeepPartialEntity<BusinessBank>,
    key : string | null = null,
    value : string | null = null,
  ) : Promise<UpdateResult> {
    try {
      return await this.bankRepo.createQueryBuilder(SchemaNames.business_bank)
        .update(BusinessBank)
        .set(values)
        .where(`${SchemaNames.business_bank}.${key} = :value` , {value})
        .execute();
    } catch(e) {
      return null;
    }
  }
}