import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Inquiry } from "src/entities/booster/inquiry/inquiry.entity";
import { User } from "src/entities/booster/user/user.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { SelectHelper } from "src/helpers/select/select.helper";
import { DataSource, DeleteResult, Repository } from "typeorm";
import { BusinessReport } from "src/entities/booster/user/report.entity";
import { RegistBusinessDto } from "./dto/regist.business.dto";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { CrefiaPurchase } from "src/entities/booster/crefia/crefia.purchase.entity";
import { CrefiaDeposit } from "src/entities/booster/crefia/crefia.deposit.entity";
import { Alert } from "src/entities/booster/user/alert.entity";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { SchemaNames } from "src/constants/schema.names";
import { userType } from "src/enums/user/user.type";
import { BusinessBank } from "src/entities/booster/user/business.bank.entity";
import { BankHistory } from "src/entities/booster/user/bank.history.entity";
import { UserCert } from "src/entities/booster/user/user.cert.entity";
import { CrefiaFee } from "src/entities/booster/crefia/crefia.fees.entity";

@Injectable()
export class UserProvider {
  static models = [
    User , 
    UserDevice , 
    Inquiry , 
    UserBusiness,
    BusinessBank,
    BankHistory,
    BusinessReport,
    CrefiaFee,
    UserCert,
    Alert,
    CrefiaCard,
    CrefiaPurchase,
    CrefiaDeposit
  ];
  constructor(
    @InjectRepository(User)
    private readonly userRepo : Repository<User>,
    @InjectRepository(UserBusiness)
    private readonly userbnRepo : Repository<UserBusiness>,
    @InjectRepository(UserDevice)
    private readonly deviceRepo : Repository<UserDevice>,
    private datasource : DataSource
  ){}

  
  public async createBusiness(
    body : RegistBusinessDto,
    user : string,
    tax_type : number
  ) : Promise<UserBusiness> {
    try {
      const business : UserBusiness = await this.userbnRepo.create({
        business_number : body.business_number,
        store_name : body.store_name ? body.store_name : null, // ksnet 
        tax_type : tax_type,
        opened_at : body.opened_at,
        user : user as unknown as User
        // type : BusinessType.none // (수정)none || ksnet || crefia
      }).save()
      return business;
    } catch(e) {
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

  public async changedUser(
    user : User,
    value : QueryDeepPartialEntity<User>,
  ) : Promise<void> {
    try {
      await this.userbnRepo.createQueryBuilder()
        .update(User)
        .set(value)
        .where('id = :id' ,{id : user.id})
        .execute();
    } catch(e) {
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

  public async changedDevice(
    device : UserDevice,
    value : QueryDeepPartialEntity<UserDevice>,
  ) : Promise<void> {
    try {
      await this.deviceRepo.createQueryBuilder()
        .update(UserDevice)
        .set(value)
        .where('id = :id' ,{id : device.id})
        .execute();
    } catch(e) {
      return null;
    }
  }

  public async databaseBizNoCheck(bizNo : string) : Promise<UserBusiness> {
    try {
      const query : UserBusiness =  await this.userbnRepo.createQueryBuilder(SchemaNames.user_businesses)
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

  public async findDeviceById(deviceId : string) : Promise<UserDevice> {
    try {
      return await this.deviceRepo.createQueryBuilder(SchemaNames.user_devices)
        .select([
          `${SchemaNames.user_devices}.card_sales_approval_alert`,
          `${SchemaNames.user_devices}.card_sales_cancel_alert`,
          `${SchemaNames.user_devices}.cash_sales_approval_alert`,
          `${SchemaNames.user_devices}.cash_sales_cancel_alert`,
          `${SchemaNames.user_devices}.device_name`,
          `${SchemaNames.user_devices}.id`,
          `${SchemaNames.user_devices}.report_alert`,
          `${SchemaNames.user_devices}.token`,
          `${SchemaNames.user_devices}.vendor_id`,
        ])
        .where(`${SchemaNames.user_devices}.id = :id` , {id : deviceId})
        .getOne();
    } catch(e) {
      return null;
    }
  }

  public async findDetailBusiness(id : string) : Promise<UserBusiness> {
    try {
      return await this.userbnRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select([
          `${SchemaNames.user_businesses}.business_number`,
          `${SchemaNames.user_businesses}.store_name`,
          `${SchemaNames.user_businesses}.sector`,
          `${SchemaNames.user_businesses}.status`,
          `${SchemaNames.user_businesses}.opened_at`,
          `${SchemaNames.user_businesses}.tax_type`,
        ])
        .where(`${SchemaNames.user_businesses}.id = :id` , {id : id})
        .getOne();
    } catch(e) {
      return null;
    }
  }

  public async removeDevice(deviceId : string) : Promise<DeleteResult> {
    try {
      return await this.deviceRepo.createQueryBuilder()
        .delete()
        .from(UserDevice)
        .where('id = :id' , {id : deviceId})
        .execute()
    } catch(e) {
      return null;
    }
  }

  public async softDelete(user : User) : Promise<boolean> {
    try {
      const removeUser = await this.userRepo.createQueryBuilder()
        .update()
        .set({
          deleted_at : new Date(),
          type : userType.withdrawn
        })
        .where(`id = :id` , {id : user.id})
        .execute()
      return removeUser ? true : false
    } catch(e) {
      return null;
    }
  }

  public async findByBizNo(businessNumber : string) : Promise<UserBusiness> {
    try {
      return await this.userbnRepo.findOneBy({
        business_number : businessNumber
      })
    } catch(e) {
      return null;
    }
  }

  public async findBzById(id : string) {
    try {
      return await this.userbnRepo.findOneBy({
        id : id
      })
    } catch(e) {
      return null;
    }
  }

  public async removeBusiness(
    business : UserBusiness
  ) {
    try {
      return await this.userbnRepo.delete({
        id : business.id
      });
    } catch(e) {
      return null;
    }
  }

  public async findAll() : Promise<Array<User>> {
    try {
      const users = await this.userRepo.createQueryBuilder('user')
        .select(SelectHelper.user_select)
        .leftJoin('user.devices' , 'devices')
        .leftJoin('user.businesses' , 'businesses')
        .orderBy('businesses.created_at' , 'ASC')
        .addOrderBy(`devices.created_at` , 'ASC')
        .getMany()
      return users;
    } catch(e) {
      return null;
    }
  }
}