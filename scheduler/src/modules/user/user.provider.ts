import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { Inquiry } from "src/entities/booster/inquiry/inquiry.entity";
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { OperatingSystemType } from "src/enums/operating.system.typs";
import { SelectHelper } from "src/helpers/select.helper";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { RegistBusinessDto } from "./dto/regist.business.dto";
import { BusinessType } from "src/enums/user/business/business.type";
import { User } from "src/entities/booster/user/user.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { CrefiaPurchase } from "src/entities/booster/crefia/crefia.purchase.entity";
import { CrefiaDeposit } from "src/entities/booster/crefia/crefia.deposit.entity";
import { Delivery } from "src/entities/booster/delivery/delivery.entity";
import { Alert } from "src/entities/booster/user/alert.entity";
import { BusinessReport } from "src/entities/booster/user/report.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { BusinessCert } from "src/entities/booster/user/business.cert.entity";
import { BusinessBank } from "src/entities/booster/user/business.bank.entity";
import { BankHistory } from "src/entities/booster/user/bank.history.entity";
import { UserCert } from "src/entities/booster/user/user.cert.entity";

@Injectable()
export class UserProvider {
  static models = [
    User , 
    UserDevice , 
    Inquiry , 
    Alert , 
    UserCert,
    UserBusiness,
    BusinessBank,
    BankHistory,
    BusinessReport,
    BusinessCert,
    CrefiaCard,
    CrefiaPurchase,
    CrefiaDeposit,
    Delivery
  ];
  constructor(
    @InjectRepository(User)
    private readonly userRepo : Repository<User>,
    @InjectRepository(UserBusiness)
    private readonly bizRepo : Repository<UserBusiness>,
    @InjectRepository(UserDevice)
    private readonly deviceRepo : Repository<UserDevice>,
    @InjectRepository(UserBusiness)
    private readonly userbnRepo : Repository<UserBusiness>,
    private datasource : DataSource
  ){}

  public async test() : Promise<User[]> {
    try {
      return await this.userRepo.createQueryBuilder(SchemaNames.users)
        .select(SelectHelper.user_select)
        .leftJoin('users.devices' , 'devices')
        .leftJoin('users.businesses' , 'businesses')
        .where('users.id = :id' , {id : '7a22ec29-fe2a-483d-91b1-1ce17db7dbfb'})
        .getMany();
    } catch(e) {
      console.log(e);
      return null;
    }
  }


  public async findById(id : string) : Promise<User> {
    try {
      return await this.userRepo.findOneBy({id});
    } catch(e) {
      return null;
    }
  }

  public async changedLogin() : Promise<void> {
    try {
      await this.bizRepo.createQueryBuilder(SchemaNames.user_businesses)
        .update(UserBusiness)
        .set({
          baemin_login : false,
          crefia_login : false,
          yogiyo_login : false,
          hometax_login : false,
          coupange_login : false
        })
        .execute()
    } catch(e) {
      return null;
    }
  }

  public async joinById(id : string) : Promise<User> {
    try {
      return await this.userRepo.createQueryBuilder(SchemaNames.users)
        .select(SelectHelper.user_select)
        .leftJoin('users.devices' , 'devices')
        .leftJoin('users.businesses' , 'businesses')
        .where('users.id = :id' , {id})
        .getOne();
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async joinAll() : Promise<User[]> {
    try {
      return await this.userRepo.createQueryBuilder(SchemaNames.users)
        .select(SelectHelper.user_select)
        .leftJoin('users.devices' , 'devices')
        .leftJoin('users.businesses' , 'businesses')
        .getMany();
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async findAccount(flag : boolean , test : string | null = null) : Promise<User[]> {
    try {
      const query = this.userRepo.createQueryBuilder(SchemaNames.users)
        .select([
          `users.id`,
          'users.mobile' ,
          'users.kakao_alert',
          `${SchemaNames.user_businesses}.id`,
          `${SchemaNames.user_businesses}.business_number`,
          `${SchemaNames.user_businesses}.member_group_id`,
          `${SchemaNames.user_businesses}.store_name`,
        ])
        .leftJoin('users.businesses' , `${SchemaNames.user_businesses}`)
      
      if (flag) {
        // 연결된 계정이 전부다 없으면 가지고 옵니다 
        query.where(`${SchemaNames.user_businesses}.crefia_id is null`)
          .andWhere(`${SchemaNames.user_businesses}.hometax_id is null`)
          .andWhere(`${SchemaNames.user_businesses}.baemin_id is null`)
          .andWhere(`${SchemaNames.user_businesses}.yogiyo_id is null`)
          .andWhere(`${SchemaNames.user_businesses}.coupange_id is null`)
          .andWhere(`${SchemaNames.user_businesses}.cert is null`)
          .andWhere(`${SchemaNames.user_businesses}.is_ksnet = :isKsnet` , {isKsnet : 0})
          .andWhere(`${SchemaNames.user_businesses}.hometax_id is null`)
      } else if(test) {
        query.where(`${SchemaNames.users}.id = :id` , {id : test})
      } else {
        // 하나라도 있으면 가지고 옵니다.
        query.where(`${SchemaNames.user_businesses}.crefia_id is not null`)
          .orWhere(`${SchemaNames.user_businesses}.hometax_id is not null`)
          .orWhere(`${SchemaNames.user_businesses}.baemin_id is not null`)
          .orWhere(`${SchemaNames.user_businesses}.yogiyo_id is not null`)
          .orWhere(`${SchemaNames.user_businesses}.coupange_id is not null`)
          .orWhere(`${SchemaNames.user_businesses}.cert is not null`)
          .orWhere(`${SchemaNames.user_businesses}.is_ksnet = :isKsnet` , {isKsnet : 1})
          .orWhere(`${SchemaNames.user_businesses}.hometax_id is not null`)
      }
      
      return await query.getMany();
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  public async changedBusiness(
    business : UserBusiness,
    values : QueryPartialEntity<UserBusiness>
  ) : Promise<void> {
    try {
      await this.userbnRepo.createQueryBuilder()
        .update(UserBusiness)
        .set(values)
        .where('id = :id' ,{id : business.id})
        .execute();
    } catch(e) {
      return null;
    }
  }

  public async findJoinBizAll(
    select : Array<string> , 
    key : string | null = null
  ) : Promise<Array<User>> {
    try {
      const users = await this.userRepo.createQueryBuilder(SchemaNames.users)
        .select(select)
        .leftJoin('users.businesses' , 'businesses')
      if(key) {
        users.where(`businesses.${key} is not :id` , {
          id : null
        })
      }
      return users.getMany();
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async findAllJoinBank() : Promise<Array<User>> {
    try {
      return await this.userRepo.createQueryBuilder(SchemaNames.users)
        .select([
          `${SchemaNames.users}.id`,
          `${SchemaNames.user_devices}.token`,
          `${SchemaNames.user_businesses}.id`,
          `${SchemaNames.user_businesses}.store_name`,
          `${SchemaNames.user_businesses}.business_number`,
          `${SchemaNames.business_bank}.cert`,
          `${SchemaNames.business_bank}.pri`,
          `${SchemaNames.business_bank}.cert_password`,
          `${SchemaNames.business_bank}.bank_id`,
          `${SchemaNames.business_bank}.bank_password`,
          `${SchemaNames.business_bank}.bank_type`,
          `${SchemaNames.business_bank}.account`,
          `${SchemaNames.business_bank}.account_password`,
        ])
        .where(`${SchemaNames.business_bank}.type = :type` , {type : 1})
        .orWhere(`${SchemaNames.business_bank}.cert is not null`)
        .orWhere(`${SchemaNames.business_bank}.bank_id is not null`)
        .leftJoin('users.businesses' , SchemaNames.user_businesses)
        .leftJoin(`users.devices` , SchemaNames.user_devices)
        .leftJoin(`${SchemaNames.user_businesses}.banks` , SchemaNames.business_bank)
        .getMany();
    } catch(e) {
      console.log(e)
      return [];
    }
  }

  public async ifHyphenFixed() : Promise<UserBusiness[]> {
    try {
      return await this.userbnRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select([
          `${SchemaNames.user_businesses}.crefia_id`,
          `${SchemaNames.user_businesses}.crefia_password`,
          `${SchemaNames.user_businesses}.crefia_login`,
          `${SchemaNames.user_businesses}.id`,
          `${SchemaNames.user_businesses}.business_number`,
          `${SchemaNames.user_businesses}.member_group_id`,
          `${SchemaNames.user_businesses}.store_name`,
          `${SchemaNames.user_businesses}.type`
        ])
        .where(`${SchemaNames.user_businesses}.crefia_id is not null `)
        .andWhere(`${SchemaNames.user_businesses}.crefia_password is not null `)
        .getMany()
    } catch(e) {
      console.log(e)
      return null
    }
  }

  public async findByCertNum(certNum : string) {
    try {
      const query = this.userbnRepo.createQueryBuilder(SchemaNames.user_businesses)
        .distinct(true)
        .select([
          `${SchemaNames.user_businesses}.cert_number as cert_number`,
          `${SchemaNames.user_businesses}.user as user`,
        ])
        .where(`${SchemaNames.user_businesses}.cert_number = :certNum` , {certNum : certNum})
      return await query.getRawMany();
    } catch(e) {
      return null
    }
  }

  
}