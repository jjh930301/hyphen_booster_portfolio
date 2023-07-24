import { InternalServerErrorException } from "@nestjs/common";
import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CrefiaCard } from "../crefia/crefia.card.entity";
import { CrefiaDeposit } from "../crefia/crefia.deposit.entity";
import { CrefiaPurchase } from "../crefia/crefia.purchase.entity";
import { CrefiaUnPurchase } from "../crefia/crefia.unpurchase.entity";
import { DeliveryDeposit } from "../delivery/delivery.deposit.entity";
import { Delivery } from "../delivery/delivery.entity";
import { HometaxCashPurchase } from "../hometax/hometax.cash.purchase.entity";
import { HometaxCashSales } from "../hometax/hometax.cash.sales.entity";
import { HometaxTax } from "../hometax/hometax.tax.entity";
import { Alert } from "./alert.entity";
import { User } from "./user.entity";
import { BusinessReport } from "./report.entity";
import { BusinessCert } from "./business.cert.entity";
import { BusinessBank } from "./business.bank.entity";
import { UserCert } from "./user.cert.entity";
import { BankHistory } from "./bank.history.entity";
import { CrefiaFee } from "../crefia/crefia.fee.entity";

@Entity({
  name : SchemaNames.user_businesses,
  database : Database.BOOSTER,
  orderBy : {
    created_at : 'ASC'
  }
})
@Index([
  'business_number',
  'member_group_id'
])
export class UserBusiness extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 40,
    comment : '사업자 번호'
    // production == unique
  })
  @Index()
  business_number : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    nullable : true,
    comment : '멤버그룹 아이디'
  })
  member_group_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 255,
    comment : '상호명',
    nullable : true
  })
  store_name : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 255,
    comment : '주소지',
    nullable : true,
    default : null
  })
  address : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    default : null,
    comment : '업종'
  })
  sector : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    default : null,
    comment : '업태'
  })
  status : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    default : null,
    nullable : true
  })
  crefia_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    default : null,
    nullable : true
  })
  crefia_password : string;

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : '여신 등록일'
  })
  crefia_updated_at : Date;

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : '여신 최근 업데이트일'
  })
  crefia_recented_at : Date;

  @Column({
    type : 'boolean',
    default : false,
    comment : '여신금융 로그인 상태 default : false'
  })
  crefia_login : boolean;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    default : null
  })
  hometax_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    default : null
  })
  hometax_password : string;

  @Column({
    type : 'datetime',
    default : null,
    nullable : true
  })
  hometax_updated_at : Date;

  @Column({
    type : 'text',
    collation : COLLATION,
    default : null,
    nullable : true
  })
  cert : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    default : null,
    nullable : true
  })
  pri : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    default : null,
    nullable : true
  })
  cert_password : string;

  @Column({
    type : 'varchar',
    length : 255,
    collation : COLLATION,
    default : null,
    nullable : true,
    comment : '인증서 번호'
  })
  cert_number : string;

  @Column({
    type : 'varchar',
    length : 255,
    collation : COLLATION,
    default : null,
    nullable : true,
    comment : '인증서 발급자'
  })
  cert_issuer : string;

  @Column({
    type : 'date',
    default : null,
    nullable : true,
    comment : '인증서 만료일'
  })
  cert_expiration : Date;

  @Column({
    type : 'datetime',
    default : null,
    nullable : true
  })
  cret_updated_at : Date;

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : '홈택스 최근 업데이트일'
  })
  hometax_recented_at : Date;

  @Column({
    type : 'boolean',
    default : false,
    comment : '홈택스 로그인 상태 default : false'
  })
  hometax_login : boolean;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
  })
  baemin_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
  })
  baemin_password : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    comment : '배민 storeid lenght가 변경될 수 있습니다'
  })
  baemin_store_id : string;

  @Column({
    type : 'boolean',
    default : false,
    comment : '배민 로그인 상태 default : false'
  })
  baemin_login : boolean;

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : '배민 등록일'
  })
  baemin_updated_at : Date;

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : '배민 최근 업데이트일'
  })
  baemin_recented_at : Date;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
  })
  yogiyo_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
  })
  yogiyo_password : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    comment : '요기요 storeid lenght가 변경될 수 있습니다'
  })
  yogiyo_store_id : string;

  @Column({
    type : 'boolean',
    default : false,
    comment : '요기요 로그인 상태 default : false'
  })
  yogiyo_login : boolean;

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : '요기요 등록일'
  })
  yogiyo_updated_at : Date;

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : '요기요 최근 업데이트일'
  })
  yogiyo_recented_at : Date;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
  })
  coupange_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
  })
  coupange_password : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    comment : '쿠팡이츠 storeid lenght가 변경될 수 있습니다'
  })
  coupange_store_id : string;

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : '쿠팡이츠 등록일'
  })
  coupange_updated_at : Date;

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : '쿠팡이츠 최근 업데이트일'
  })
  coupange_recented_at : Date;

  @Column({
    type : 'boolean',
    default : false,
    comment : '쿠팡이츠 로그인 상태 default : false'
  })
  coupange_login : boolean;

  @Column({
    type : 'tinyint',
    default : 0,
    comment : '1 : ksnet or another van'
  })
  type : number;

  @Column({
    type : 'tinyint',
    comment : '사업자 유형'
  })
  tax_type : number;

  @OneToMany(
    () => Alert,
    alerts => alerts.business,
    CASCADE_OPTION
  )
  alerts : Array<Alert>

  @OneToMany(
    () => CrefiaCard,
    crefia_card => crefia_card.business,
    CASCADE_OPTION
  )
  crefia_cards : Array<CrefiaCard>;

  @OneToMany(
    () => CrefiaPurchase,
    crefia_purchase => crefia_purchase.business,
    CASCADE_OPTION
  )
  crefia_purchases : Array<CrefiaPurchase>;

  @OneToMany(
    () => CrefiaDeposit,
    crefia_deposit => crefia_deposit.business,
    CASCADE_OPTION
  )
  crefia_deposits : Array<CrefiaDeposit>;

  @OneToMany(
    () => CrefiaUnPurchase,
    crefia_unpurchases => crefia_unpurchases.business,
    CASCADE_OPTION
  )
  crefia_unpurchasess : Array<CrefiaUnPurchase>;

  @OneToMany(
    () => CrefiaFee,
    crefia_fee => crefia_fee.business,
    CASCADE_OPTION
  )
  crefia_fees : Array<CrefiaFee>;

  @OneToMany(
    () => HometaxCashPurchase,
    hometax_cash_purchases => hometax_cash_purchases.business,
    CASCADE_OPTION
  )
  hometax_cash_purchases : Array<HometaxCashPurchase>;

  @OneToMany(
    () => HometaxCashSales,
    hometax_cash_sales => hometax_cash_sales.business,
    CASCADE_OPTION
  )
  hometax_cash_sales : Array<HometaxCashSales>;

  @OneToMany(
    () => HometaxTax,
    hometax_taxes => hometax_taxes.business,
    CASCADE_OPTION
  )
  hometax_taxes : Array<HometaxTax>;

  @OneToMany(
    () => Delivery,
    deliveries => deliveries.business,
    CASCADE_OPTION
  )
  deliveries : Array<Delivery>

  @OneToMany(
    () => BankHistory,
    history => history.bank,
    CASCADE_OPTION
  )
  histories : Array<BankHistory> 

  @OneToMany(
    () => DeliveryDeposit,
    delivery_deposits => delivery_deposits.business,
    CASCADE_OPTION
  )
  delivery_deposits : Array<Delivery>

  @ManyToOne(
    () => User,
    user => user.businesses,
    CHILD_CASCADE_OPTION
  )
  @JoinColumn({
    name : 'user'
  })
  user : User;

  @OneToMany(
    () => BusinessReport,
    user_reports => user_reports.business,
    CASCADE_OPTION
  )
  reports : Array<BusinessReport>

  @OneToMany(
    () => UserCert,
    cert => cert.business,
    CASCADE_OPTION,
  )
  certs : Array<UserCert>

  @OneToMany(
    () => BusinessBank,
    busienss_bank => busienss_bank.business,
    CASCADE_OPTION
  )
  banks : Array<BusinessBank>

  @Column({
    type : 'tinyint',
    default : 0,
    comment : '0 : 일반 유저 / 1 : ksnet 유저 / 2 : ksnet 유저이지만 동의하지 않음 | ksnet 동의 내용을 보여주지 않음'
  })
  is_ksnet : number;

  @Column({
    type : 'tinyint',
    default : 0,
    comment : '0 : default / 1 : 선정산 / 2 : 신청중 / 3 : 반려 / 4 : 해지'
  })
  is_paid : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    comment : 'ylsolution 요청 pk'
  })
  h_id : string;

  @Column({
    type : 'datetime',
    default : null,
    nullable : true,
    comment : 'ksnet 약관 동의 일자'
  })
  agreemented_at : Date;

  @Column({
    type : 'date',
    default : null,
    nullable : true,
    comment : '개업일자'
  })
  opened_at : Date;

  @CreateDateColumn({
    name : 'created_at',
    comment : '생성일'
  })
  created_at : Date;

  @UpdateDateColumn({
    name : 'updated_at',
    comment : '최근 업데이트일'
  })
  updated_at : Date;

  @DeleteDateColumn({
    name : 'deleted_at',
    comment : '삭제일'
  })
  deleted_at : Date;
}