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
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { User } from "src/entities/booster/user/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserProvider {
  static models = [
    User , 
    UserDevice , 
    Inquiry , 
    UserBusiness,
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
    HometaxTax,
    Delivery,
    DeliveryDeposit
  ]

  constructor(
    @InjectRepository(User)
    private readonly userRepo : Repository<User>,
    @InjectRepository(UserBusiness)
    private readonly bizRepo : Repository<UserBusiness>
  ){}

  public async findByBizNo(businessNumber : string) : Promise<UserBusiness> {
    try {
      return await this.bizRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select([
          `${SchemaNames.user_businesses}.business_number AS business_number`,
          `${SchemaNames.user_businesses}.store_name AS store_name`,
          `${SchemaNames.user_businesses}.user AS user_id`,
        ])
        .where(`${SchemaNames.user_businesses}.business_number = :bizNo` , {
          bizNo : businessNumber
        })
        .getRawOne()
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

  public async joinBusiness(id : string , select : string[]) : Promise<User> {
    try {
      return await this.userRepo.createQueryBuilder('users')
        .select(select)
        .leftJoin('users.businesses' , 'businesses')
        .where('users.id = :id' , {id})
        .orderBy('businesses.created_at' , 'ASC')
        .getOne();
    } catch(e) {
      return null;
    }
  }
}