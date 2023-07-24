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
import { QueryRunner, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class UserProvider {
  static models = [
    User , 
    UserDevice , 
    Inquiry , 
    UserBusiness,
    BusinessReport,
    BusinessCert,
    BusinessBank,
    UserCert,
    BankHistory,
    Alert,
    CrefiaCard,
    CrefiaPurchase,
    CrefiaDeposit,
    CrefiaUnPurchase,
    HometaxCashPurchase,
    HometaxCashSales,
    HometaxTax,
    Delivery,
    DeliveryDeposit
  ];

  constructor(
    @InjectRepository(UserBusiness)
    private readonly bizRepo : Repository<UserBusiness>,
    @InjectRepository(User)
    private readonly userRepo : Repository<User>
  ){}

  public async findByBzId(id : string) : Promise<UserBusiness> {
    try {
      return await this.bizRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select(['*'])
        .where(`${SchemaNames.user_businesses}.id = :id` , {id})
        .getRawOne()
    } catch(e) {
      return null;
    }
  }

  public async changedBusiness(
    business : UserBusiness,
    value : QueryDeepPartialEntity<UserBusiness>,
    queryRunner : QueryRunner | null = null
  ) : Promise<void> {
    try {
      await this.bizRepo
        .createQueryBuilder(
          SchemaNames.user_businesses,
          queryRunner ? queryRunner : null
        )
        .update(UserBusiness)
        .set(value)
        .where('id = :id' ,{id : business.id})
        .execute();
    } catch(e) {
      return null;
    }
  }

  public async findUserById(id){
    try {
      return await this.userRepo.createQueryBuilder(SchemaNames.users)
      .select([
        `${SchemaNames.users}.mobile`
      ])
      .where(`${SchemaNames.users}.id = :id` , {id : id})
      .getOne()
    } catch(e) {
      return null;
    }
  }

  public async findDevicesByUserId(id : string) : Promise<User> {
    try {
      return await this.userRepo.createQueryBuilder('users')
        .select([
          `${SchemaNames.users}.id`,
          `devices.token`
        ])
        .leftJoin('users.devices' , 'devices')
        .leftJoin('users.businesses' , 'businesses')
        .where('users.id = :id' , {id})
        .getOne();
    } catch(e) {
      return null;
    }
  }
}