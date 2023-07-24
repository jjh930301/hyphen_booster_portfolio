import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { CrefiaDeposit } from "src/entities/booster/crefia/crefia.deposit.entity";
import { CrefiaPurchase } from "src/entities/booster/crefia/crefia.purchase.entity";
import { CrefiaUnPurchase } from "src/entities/booster/crefia/crefia.unpurchase.entity";
import { DeliveryDeposit } from "src/entities/booster/delivery/delivery.deposit.entity";
import { Delivery } from "src/entities/booster/delivery/delivery.entity";
import { HometaxCashPurchase } from "src/entities/booster/hometax/hometax.cash.purchase.entity";
import { HometaxCashSales } from "src/entities/booster/hometax/hometax.cash.sales.entity";
import { HometaxTax } from "src/entities/booster/hometax/hometax.tax.entity";
import { Inquiry } from "src/entities/booster/inquiry/inquiry.entity";
import { Alert } from "src/entities/booster/user/alert.entity";
import { BankHistory } from "src/entities/booster/user/bank.history.entity";
import { BusinessBank } from "src/entities/booster/user/business.bank.entity";
import { BusinessCert } from "src/entities/booster/user/business.cert.entity";
import { BusinessReport } from "src/entities/booster/user/report.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { UserCert } from "src/entities/booster/user/user.cert.entity";
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { User } from "src/entities/booster/user/user.entity";
import { Repository, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { PaginationDto } from "./dto/pagination.dto";
import { SearchDto } from "./dto/search.dto";
import { UserTypesDto } from "./dto/user.types.dto";

@Injectable()
export class UserProvider {
  static models = [
    User, 
    UserDevice, 
    Inquiry, 
    UserBusiness,
    UserCert,
    BusinessReport,
    BusinessBank,
    BankHistory,
    BusinessCert,
    Alert,
    CrefiaCard,
    CrefiaPurchase,
    CrefiaDeposit,
    CrefiaUnPurchase,
    HometaxCashPurchase,
    HometaxCashSales,
    HometaxCashPurchase,
    HometaxTax,
    Delivery,
    DeliveryDeposit
  ]
  constructor(
    @InjectRepository(User)
    private readonly userRepo : Repository<User>,
    @InjectRepository(UserBusiness)
    private readonly userbnRepo : Repository<UserBusiness>
  ) {}

  public async count(
    startDate : string,
    endDate : string,
  ) {
    try {
      const query = this.userRepo.createQueryBuilder(SchemaNames.users)
      if(startDate && endDate) {
        query.where(`${SchemaNames.users}.created_at BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      return await query.getCount();
    } catch(e) {
      return null;
    }
  }

  public async countList(
    startDate,
    endDate,
    type
  ) {
    const obj = {
      1 : `DATE_FORMAT(${SchemaNames.users}.created_at , '%Y%m%d') AS date`,
      2 : `DATE_FORMAT(
        FROM_DAYS(
            TO_DAYS(${SchemaNames.users}.created_at) 
            - MOD(TO_DAYS(${SchemaNames.users}.created_at) -2, 7
          )
        ) , '%Y%m%d') AS date`,
      3 : `DATE_FORMAT(${SchemaNames.users}.created_at , '%Y%m') AS date`,
    };
    try {
      const query = this.userRepo.createQueryBuilder(SchemaNames.users)
        .select([
          `count(${SchemaNames.users}.id) AS count`,
          `${obj[type]}`
        ])
        if(startDate && endDate) {
          query.where(`${SchemaNames.users}.created_at BETWEEN :start_date AND :end_date` , {
            start_date : startDate,
            end_date : endDate
          })
        }
      return await query.groupBy('date').getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async userCount(
    types : UserTypesDto,
    startDate : string,
    endDate : string,
    search : SearchDto
  ) {
    try {
      const query = await this.userRepo.createQueryBuilder(SchemaNames.users)
        .leftJoin(`${SchemaNames.users}.businesses` , 'businesses')
      if(startDate && endDate) {
        query.where(`${SchemaNames.users}.created_at BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
        if(types.type === 0 || types.type) {
          query.andWhere(`${SchemaNames.users}.type = ${Number(types.type)}`)
        }
        if(types.gender === 0 || types.gender === 1) {
          query.andWhere(`${SchemaNames.users}.gender = ${Number(types.gender)}`)
        }
      }
      if(!startDate && !endDate) {
        if(types.type === 0 || types.type) {
          query.where(`${SchemaNames.users}.type = ${Number(types.type)}`)
        }
        if(types.gender === 0 || types.gender === 1) {
          query.where(`${SchemaNames.users}.gender = ${Number(types.gender)}`)
        }
        if((types.type === 0 || types.type) && (types.gender === 0 || types.gender === 1)) {
          query
            .where(`${SchemaNames.users}.type = ${Number(types.type)}`)
            .andWhere(`${SchemaNames.users}.gender = ${types.gender}`);
        }
      }
      if(search.word && search.search) {
        const column = {
          1 : `${SchemaNames.users}.user_num`,
          2 : `${SchemaNames.users}.name`,
          3 : `${SchemaNames.users}.mobile`,
          4 : `businesses.business_number`
        }
        query.where(
          `${column[search.search]} LIKE :word` , {
          word : `%${search.word}%`
        })
      }
      if(types.business) {
        const checkNull = {
          1 : 'is not null',
          2 : 'is null'
        }
        query.andWhere(`businesses.id ${checkNull[types.business]} `)
      }

      if(types.connected) {
        const orWhere = {
          1 : `(
            businesses.hometax_id is not null OR
            businesses.crefia_id is not null OR
            businesses.baemin_id is not null OR
            businesses.yogiyo_id is not null OR
            businesses.coupange_id is not null OR
            businesses.is_ksnet = 1 
          )`,
          2 : `(
            businesses.hometax_id is null AND
            businesses.crefia_id is null AND
            businesses.baemin_id is null AND
            businesses.yogiyo_id is null AND
            businesses.coupange_id is null AND
            businesses.is_ksnet != 1 
          )`, 
        }
        query.andWhere(`${orWhere[types.connected]} `)
      }
      if(types.is_paid) {
        if(types.is_paid) {
          query.andWhere(`businesses.is_paid = ${types.is_paid}`);
        }
      }
      return query.getCount();
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  public async users(
    page : PaginationDto,
    types : UserTypesDto,
    startDate : string,
    endDate : string,
    search : SearchDto
  ) : Promise<User[]> {
    try {
      
      const query =  this.userRepo.createQueryBuilder(SchemaNames.users)
        .select([
          `${SchemaNames.users}.id`,
          `${SchemaNames.users}.user_num`,
          `${SchemaNames.users}.name`,
          `${SchemaNames.users}.mobile`,
          `${SchemaNames.users}.gender`,
          `${SchemaNames.users}.date_of_birth`,
          `${SchemaNames.users}.type`,
          `businesses.id`,
          `businesses.hometax_id`,
          `businesses.crefia_id`,
          `businesses.baemin_id`,
          `businesses.yogiyo_id`,
          `businesses.coupange_id`,
          `businesses.business_number`,
          `businesses.is_ksnet`,
          `businesses.is_paid`,
          `${SchemaNames.users}.created_at`,
          `${SchemaNames.users}.refreshed_at`,
          `${SchemaNames.users}.deleted_at`,
        ])
        .leftJoin(`${SchemaNames.users}.businesses` , 'businesses')
      if(startDate && endDate) {
        query.where(`${SchemaNames.users}.created_at BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
        if(types.type === 0 || types.type) {
          query.andWhere(`${SchemaNames.users}.type = ${Number(types.type)}`)
        }
        if(types.gender === 0 || types.gender === 1) {
          query.andWhere(`${SchemaNames.users}.gender = ${Number(types.gender)}`)
        }
      }
      if(!startDate && !endDate) {
        if(types.type === 0 || types.type) {
          query.where(`${SchemaNames.users}.type = ${Number(types.type)}`)
        }
        if(types.gender === 0 || types.gender === 1) {
          query.where(`${SchemaNames.users}.gender = ${Number(types.gender)}`)
        }
        if((types.type === 0 || types.type) && (types.gender === 0 || types.gender === 1)) {
          query
            .where(`${SchemaNames.users}.type = ${Number(types.type)}`)
            .andWhere(`${SchemaNames.users}.gender = ${types.gender}`);
        }
      }
      if(search.word && search.search) {
        const column = {
          1 : `${SchemaNames.users}.user_num`,
          2 : `${SchemaNames.users}.name`,
          3 : `${SchemaNames.users}.mobile`,
          4 : `businesses.business_number`
        }
        query.where(
          `${column[search.search]} LIKE :word` , {
          word : `%${search.word}%`
        })
      }
      if(types.business) {
        const checkNull = {
          1 : 'is not null',
          2 : 'is null'
        }
        query.andWhere(`businesses.id ${checkNull[types.business]} `)
      }

      if(types.connected) {
        const orWhere = {
          1 : `(
            businesses.hometax_id is not null OR
            businesses.crefia_id is not null OR
            businesses.baemin_id is not null OR
            businesses.yogiyo_id is not null OR
            businesses.coupange_id is not null OR
            businesses.is_ksnet = 1 
          )`,
          2 : `(
            businesses.hometax_id is null AND
            businesses.crefia_id is null AND
            businesses.baemin_id is null AND
            businesses.yogiyo_id is null AND
            businesses.coupange_id is null AND
            businesses.is_ksnet != 1 
          )`, 
        }
        query.andWhere(`${orWhere[types.connected]} `)
      }
      if(types.is_paid) {
        query.andWhere(`businesses.is_paid = ${types.is_paid}`);
      }
      
      
      return await query
        .orderBy(`${SchemaNames.users}.created_at` , 'DESC')
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
        .getMany();
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  public async changedBusiness(
    business : UserBusiness,
    value : QueryDeepPartialEntity<UserBusiness>,
  ) : Promise<void> {
    try {
      await this.userbnRepo.createQueryBuilder()
        .update(UserBusiness)
        .set(value)
        .where('id = :id' ,{id : business.id})
        .execute();
    } catch(e) {
      return null;
    }
  }

  public async detailUser(
    id : string
  ) {
    try {
      const query = await this.userRepo.createQueryBuilder(SchemaNames.users)
        .select([
          `${SchemaNames.users}.id`,
          `${SchemaNames.users}.user_num`,
          `${SchemaNames.users}.name`,
          `${SchemaNames.users}.mobile`,
          `${SchemaNames.users}.date_of_birth`,
          `${SchemaNames.users}.gender`,
          `${SchemaNames.users}.type`,
          `${SchemaNames.users}.created_at`,
          `${SchemaNames.users}.refreshed_at`,
          `businesses.id`,
          `businesses.business_number`,
          `businesses.store_name`,
          `businesses.crefia_id`,
          `businesses.crefia_updated_at`,
          `businesses.hometax_id`,
          `businesses.hometax_updated_at`,
          `businesses.baemin_id`,
          `businesses.baemin_updated_at`,
          `businesses.yogiyo_id`,
          `businesses.yogiyo_updated_at`,
          `businesses.coupange_id`,
          `businesses.coupange_updated_at`,
          `businesses.is_ksnet`,
          `businesses.is_paid`,
          `businesses.agreemented_at`,
          `businesses.opened_at`,
          `businesses.created_at`,
          `devices.id`,
          `devices.device_name`,
          `devices.operating_system`,
          `banks.id`,
          `banks.account`,
          `banks.account_name`,
          `banks.type`,
          `banks.bank_type`,
          `banks.status`,
          `banks.cert`,
          `banks.bank_id`,
          `banks.is_paid`,
          `banks.paid_open`,
          `banks.paid_opened_at`,
          `banks.sales_person_id`,
          `banks.sales_person`,
          `banks.sales_person_mobile`,
          `banks.contracted_at`,
          `banks.contract_ended_at`,
          `banks.paid_started_at`,
          `banks.connected_at`,
          `banks.created_at`,
          `banks.paid_ended_at`,
        ])
        .leftJoin(`${SchemaNames.users}.businesses` , 'businesses')
        .leftJoin(`${SchemaNames.users}.devices` , 'devices')
        .leftJoin(`businesses.banks` , 'banks')
        .where(`${SchemaNames.users}.id = :id` , {id})
        .getOne();

      return query
    } catch(e) {  
      return null;
    }
  }

  public async changedStatus(
    id : string,
    value : QueryDeepPartialEntity<User>,
  ) : Promise<UpdateResult> {
    try {
      return await this.userRepo.createQueryBuilder()
        .update(User)
        .set(value)
        .where('id = :id' ,{id : id})
        .execute();
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  public async joinById(id : string , select : string[]) : Promise<User> {
    try {
      return await this.userRepo.createQueryBuilder('users')
        .select(select)
        .leftJoin('users.devices' , 'devices')
        .leftJoin('users.businesses' , 'businesses')
        .where('users.id = :id' , {id})
        .orderBy('businesses.created_at' , 'ASC')
        .addOrderBy(`devices.created_at` , 'ASC')
        .getOne();
    } catch(e) {
      return null;
    }
  }
}