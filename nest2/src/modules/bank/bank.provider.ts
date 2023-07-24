import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { BusinessBank } from "src/entities/booster/user/business.bank.entity";
import { BusinessCert } from "src/entities/booster/user/business.cert.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { encrypt } from "src/utils/crypto";
import { DeleteResult, InsertResult, Repository, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { RegistBankDto } from "./dto/regist.bank.dto";

@Injectable()
export class BankProvider {
  constructor(
    @InjectRepository(BusinessBank)
    private readonly bankRepo : Repository<BusinessBank>,
  ){}

  public async findById(bank_id) : Promise<BusinessBank> {
    return await this.bankRepo.createQueryBuilder(SchemaNames.business_bank)
      .select()
      .where(`${SchemaNames.business_bank}.id = :bank_id` , {bank_id})
      .getOne()
  }

  public async findByBiz(
    businessId : string , 
    key : string | null = null , 
    value : string | null = null
  ) : Promise<Array<BusinessBank>> {
    try {
      const query = this.bankRepo.createQueryBuilder(SchemaNames.business_bank)
        .select()
        .where(`${SchemaNames.business_bank}.business = :businessId` , {businessId})
      if (key) {
        query.andWhere(`${SchemaNames.business_bank}.${key} = :value` , {value})
        return await query.getMany();
      }
      return await query.getMany();
    } catch(e) {
      console.log(e)
      return []
    }
  }

  public async findByBizAndKey(
    business : UserBusiness , 
    key : string | null = null,
    value : string | null = null,
  ) : Promise<BusinessBank | Array<BusinessBank>> {
    try {
      const query = this.bankRepo.createQueryBuilder(SchemaNames.business_bank)
        .select([
          `${SchemaNames.business_bank}.id as id`,
          `${SchemaNames.business_bank}.account as account`,
          `${SchemaNames.business_bank}.account_name as account_name`,
          `${SchemaNames.business_bank}.type as type`,
          `(CASE 
		          WHEN ISNULL(cert) AND ISNULL(bank_id)
              THEN 0
              WHEN ISNULL(bank_id)
              THEN 1
			        WHEN ISNULL(cert) 
              THEN 2
			      ELSE 0 END) as connect_type`,
          `${SchemaNames.business_bank}.is_paid as is_paid`,
          `${SchemaNames.business_bank}.bank_type as bank_type`,
          `${SchemaNames.business_bank}.recent_at as recent_at`,
          `${SchemaNames.business_bank}.created_at as created_at`,
          `${SchemaNames.business_bank}.updated_at as updated_at`,
        ])
        .where(`${SchemaNames.business_bank}.business = :businessId` , {
          businessId : business.id
        })
      if (key) {
        query.andWhere(`${SchemaNames.business_bank}.${key} = :value` , {value})
        return await query.getOne();
      }
        
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async updateBankInfo(
    values : QueryDeepPartialEntity<BusinessBank>,
    key : string | null = null,
    value : string | null = null,
  ) : Promise<UpdateResult> {
    try {
      const query = await this.bankRepo.createQueryBuilder(SchemaNames.business_bank)
        .update(BusinessBank)
        .set(values)
        .where(`${SchemaNames.business_bank}.${key} = :value` , {value : value})
      return query.execute();
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  public async createBank(
    business : UserBusiness,
    data : RegistBankDto
  ) : Promise<InsertResult> {
    try {
      return await this.bankRepo.createQueryBuilder()
        .insert()
        .into(BusinessBank)
        .values({
          business : business,
          account : data.account,
          account_name : data.account_name,
          account_password : data.account_password ? await encrypt(data.account_password) : null,
          type : data.type,
          bank_type : data.bank_type,
          cert_number : data.cert_num ? data.cert_num : null,
          cert : data.cert ? data.cert : null,
          pri : data.pri ? data.pri : null,
          cert_password : data.cert_password ? data.cert_password : null,
          bank_id : data.bank_id ? data.bank_id : null,
          bank_password : data.bank_password ? await encrypt(data.bank_password) : null,
          is_paid : data.is_paid,
          paid_open : 0,
          paid_opened_at : new Date(),
          sales_person : null,
          is_login : false,
        })
        .execute()
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  public async deleteAccount(bankId : string) : Promise<DeleteResult> {
    try {
      return await this.bankRepo.createQueryBuilder()
        .delete()
        .from(BusinessBank)
        .where('id = :id' , {id : bankId})
        .execute()
    } catch(e) {
      return null;
    }
  }
}