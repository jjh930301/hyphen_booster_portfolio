import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SchemaNames } from 'src/constants/schema.names';
import { CrefiaCard } from 'src/entities/booster/crefia/crefia.card.entity';
import { CrefiaDeposit } from 'src/entities/booster/crefia/crefia.deposit.entity';
import { CrefiaFee } from 'src/entities/booster/crefia/crefia.fees.entity';
import { CrefiaPurchase } from 'src/entities/booster/crefia/crefia.purchase.entity';
import { CrefiaUnPurchase } from 'src/entities/booster/crefia/crefia.unpurchase.entity';
import { DeliveryDeposit } from 'src/entities/booster/delivery/delivery.deposit.entity';
import { Delivery } from 'src/entities/booster/delivery/delivery.entity';
import { HometaxCashPurchase } from 'src/entities/booster/hometax/hometax.cash.purchase.entity';
import { HometaxCashSales } from 'src/entities/booster/hometax/hometax.cash.sales.entity';
import { HometaxTax } from 'src/entities/booster/hometax/hometax.tax.entity';
import { Inquiry } from 'src/entities/booster/inquiry/inquiry.entity';
import { Alert } from 'src/entities/booster/user/alert.entity';
import { BankHistory } from 'src/entities/booster/user/bank.history.entity';
import { BusinessBank } from 'src/entities/booster/user/business.bank.entity';
import { BusinessCert } from 'src/entities/booster/user/business.cert.entity';
import { BusinessReport } from 'src/entities/booster/user/report.entity';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { UserCert } from 'src/entities/booster/user/user.cert.entity';
import { UserDevice } from 'src/entities/booster/user/user.device.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { encrypt } from 'src/utils/crypto';
import { DataSource, DeleteResult, InsertResult, QueryRunner, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CertDto } from './dto/cert.dto';

@Injectable()
export class UserProvider {

  static models = [
    User , 
    UserDevice , 
    UserCert,
    Inquiry , 
    UserBusiness,
    BusinessReport,
    BusinessCert,
    BusinessBank,
    BankHistory,
    Alert,
    CrefiaCard,
    CrefiaPurchase,
    CrefiaDeposit,
    CrefiaUnPurchase,
    CrefiaFee,
    HometaxCashPurchase,
    HometaxCashSales,
    HometaxTax,
    Delivery,
    DeliveryDeposit
  ];

  constructor(
    @InjectRepository(User)
    private readonly userRepo : Repository<User>,
    @InjectRepository(UserBusiness)
    private readonly userbnRepo : Repository<UserBusiness>,
    @InjectRepository(UserDevice)
    private readonly deviceRepo : Repository<UserDevice>,
    @InjectRepository(BusinessCert)
    private readonly certRepo : Repository<BusinessCert>,
    @InjectRepository(UserCert)
    private readonly userCertRepo : Repository<UserCert>,
    @InjectRepository(BusinessBank)
    private readonly bankRepo : Repository<BusinessBank>,
    private datasource : DataSource
  ){}

  public async findByBzId(id : string) : Promise<UserBusiness> {
    try {
      return await this.userbnRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select(['*'])
        .where(`${SchemaNames.user_businesses}.id = :id` , {id})
        .getRawOne()
    } catch(e) {
      return null;
    }
  }

  public async findUserById(id : string){
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

  public async test() : Promise<UserBusiness> {
    try {
      return await this.userbnRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select()
        .where(`${SchemaNames.user_businesses}.id = :id` , {id : '8752a563-970f-4ce2-acf5-6f9ba2d9d5be'})
        .getOne()
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

  public async findBzById(id : string) {
    try {
      return await this.userbnRepo.findOneBy({
        id : id
      })
    } catch(e) {
      return null;
    }
  }

  public async createCert(
    user : User,
    business : UserBusiness,
    cert : CertDto
  ) : Promise<InsertResult> {
    try {
      return await this.userCertRepo.createQueryBuilder(SchemaNames.user_certs)
        .insert()
        .into(UserCert)
        .values({
          user,
          business : business,
          cert : await encrypt(cert.cert),
          pri : await encrypt(cert.pri),
          cert_password : await encrypt(cert.cert_password),
          cert_number : cert.cert_number,
          cert_issuer : cert.cert_issuer,
          cert_expiration : cert.cert_expiration,
          cret_updated_at : new Date(),
          oid : cert.oid
        })
        .execute()
    } catch(e) {
      return null;
    }
  }

  public async deleteCert(
    user : User,
    certNumber : string,
    queryRunner : QueryRunner | null = null
  ) : Promise<DeleteResult> {
    try {
      return await this.userCertRepo.createQueryBuilder(SchemaNames.user_certs , queryRunner)
        .delete()
        .from(UserCert)
        .where(`${SchemaNames.user_certs}.user = :userId` , {
          userId : user.id
        })
        .andWhere(`${SchemaNames.user_certs}.cert_number = :certNumber` , {
          certNumber : certNumber
        })
        .execute()
    } catch(e) {
      console.log(e)
      return null;
    }
  }
  

  public async changedBusiness(
    business : UserBusiness,
    value : QueryDeepPartialEntity<UserBusiness>,
    queryRunner : QueryRunner | null = null
  ) : Promise<void> {
    try {
      await this.userbnRepo
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

  public async findOneCertByBzAndCertNum(
    user : User , 
    certNum : string
  ) : Promise<UserCert> {
    try {
      return await this.userCertRepo.createQueryBuilder(SchemaNames.user_certs)
        .select()
        .where(`${SchemaNames.user_certs}.user = :user` , {user : user.id})
        .andWhere(`${SchemaNames.user_certs}.cert_number = :certNum` , {certNum : certNum})
        .getOne()
    } catch(e) {
      return null;
    }
  }

  public async findCertByBusiness(business : string) {
    try {
      const query = this.userCertRepo.createQueryBuilder(SchemaNames.user_certs)
        .select([
          `${SchemaNames.user_certs}.user as user`,
          `${SchemaNames.user_certs}.cert_number as cert_number`,
          `${SchemaNames.user_certs}.cert_issuer as cert_issuer`,
          `${SchemaNames.user_certs}.cert_expiration as cert_expiration`,
          `${SchemaNames.user_certs}.oid as oid`,
        ])
        .where(`${SchemaNames.user_certs}.business = :business` , {business : business})
      
      query.andWhere(`${SchemaNames.user_certs}.cert_number is not null`)
        .andWhere(`${SchemaNames.user_certs}.cert_issuer is not null`)
        .andWhere(`${SchemaNames.user_certs}.cert_expiration is not null`)
      
      return await  query.getRawMany()
    } catch(e) {
      return null;
    }
  }
}