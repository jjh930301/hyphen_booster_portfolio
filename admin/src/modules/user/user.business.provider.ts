import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
import { InsertResult, Repository } from "typeorm";
import { TestBusinessDto } from "./dto/test.business.dto";

@Injectable()
export class UserBusinessProvider {
  constructor(
    @InjectRepository(UserBusiness)
    private readonly businessRepo : Repository<UserBusiness>,
  ) {}

  public async count(
    startDate : string,
    endDate : string,
  ) {
    try {
      const query = this.businessRepo.createQueryBuilder(SchemaNames.user_businesses)
      if(startDate && endDate) {
        query.where(`${SchemaNames.user_businesses}.created_at BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      return await query.getCount()
    } catch(e) {
      return null;
    }
  }

  public async countList(
    startDate : string,
    endDate : string,
    type : number,
    key : string
  ) {
    try {
      const obj = {
        1 : `DATE_FORMAT(${SchemaNames.user_businesses}.${key}_updated_at , '%Y%m%d') AS date`,
        2 : `DATE_FORMAT(
          FROM_DAYS(
              TO_DAYS(${SchemaNames.user_businesses}.${key}_updated_at) 
              - MOD(TO_DAYS(${SchemaNames.user_businesses}.${key}_updated_at) -2, 7
            )
          ) , '%Y%m%d') AS date`,
        3 : `DATE_FORMAT(${SchemaNames.user_businesses}.${key}_updated_at , '%Y%m') AS date`,
      };
      const query = this.businessRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select([
          `count(${SchemaNames.user_businesses}.${key}_id) AS count`,
          `${obj[type]}`
        ])
      if(startDate && endDate) {
        query.where(`${SchemaNames.user_businesses}.created_at BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      return await query.groupBy('date').getRawMany();
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async businessCountList(
    startDate : string,
    endDate : string,
    type : number,
  ) {
    try {
      const obj = {
        1 : `DATE_FORMAT(${SchemaNames.user_businesses}.created_at , '%Y%m%d') AS date`,
        2 : `DATE_FORMAT(
          FROM_DAYS(
              TO_DAYS(${SchemaNames.user_businesses}.created_at) 
              - MOD(TO_DAYS(${SchemaNames.user_businesses}.created_at) -2, 7
            )
          ) , '%Y%m%d') AS date`,
        3 : `DATE_FORMAT(${SchemaNames.user_businesses}.created_at , '%Y%m') AS date`,
      };
      const query = this.businessRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select([
          `count(${SchemaNames.user_businesses}.created_at) AS count`,
          `${obj[type]}`
        ])
      if(startDate && endDate) {
        query.where(`${SchemaNames.user_businesses}.created_at BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      return await query.groupBy('date').getRawMany();
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async findBusinessesByUser(id : string) {
    try {
      return await this.businessRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select([
          `${SchemaNames.user_businesses}.id`
        ])
        .where(`${SchemaNames.user_businesses}.user = :user` , {
          user : id
        })
        .getMany();
    } catch(e) {
      return null;
    }
  }

  public async findByIdAccount(
    businessId : string,
    /**
     * 1 : 여신금융협회
     * 2 : 홈택스
     * 3 : 배달
     */
    type : number
  ) {
    const obj = {
      1 : {
        id : 'crefia_id',
        password : 'crefia_password',
        member_id : 'member_group_id' // 여신
      },
      2 : {
        id : 'hometax_id',
        password : 'hometax_password',
        member_id : 'member_group_id' // 홈택스
      },
      3 : {
        id : 'baemin_id',
        password : 'baemin_password',
        member_id : 'baemin_store_id' // 배민
      }
    }
    try {
      return await this.businessRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select([
          `${SchemaNames.user_businesses}.id as id`,
          `${SchemaNames.user_businesses}.business_number as business_number`,
          `${SchemaNames.user_businesses}.${obj[type].id} as comp_id`,
          `${SchemaNames.user_businesses}.${obj[type].password} as password`,
          `${SchemaNames.user_businesses}.member_group_id as member_id`,
          `${SchemaNames.user_businesses}.created_at as created_at`,
        ])
        .where(`${SchemaNames.user_businesses}.id = :id` , {
          id : businessId
        })
        .getRawOne()
    } catch(e) {
      return null;
    }
  }

  public async createBusiness(
    user : User,
    body : TestBusinessDto,
    tax_type : number
  ) : Promise<UserBusiness> {
    try {
      const insertResult : InsertResult = await this.businessRepo.createQueryBuilder(SchemaNames.user_businesses) 
        .insert()
        .into(UserBusiness)
        .values({
          business_number : body.business_number,
          store_name : body.store_name ? body.store_name : null, // ksnet 
          tax_type : tax_type,
          opened_at : body.opened_at,
          user : user
        })
        .execute()
      const business : UserBusiness = insertResult.generatedMaps as unknown as UserBusiness
      return business;
    } catch(e) {
      return null;
    }
  }

  public async databaseBizNoCheck(bizNo : string) : Promise<UserBusiness> {
    try {
      const query : UserBusiness =  await this.businessRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select([
          `${SchemaNames.user_businesses}.store_name`,
          `${SchemaNames.users}.name`,
          `concat(
            substring(${SchemaNames.users}.mobile,1,3),
            '-',
            substring(${SchemaNames.users}.mobile,4,4), 
            '-',
            '****'
          ) as users_mobile`,
        ])
        .leftJoin(`${SchemaNames.user_businesses}.user` , 'users')
        .where(`${SchemaNames.user_businesses}.business_number = :biz_no` , {
          biz_no : bizNo
        })
        .getRawOne()
      return query
    } catch(e) {
      return null;
    }
  }
}