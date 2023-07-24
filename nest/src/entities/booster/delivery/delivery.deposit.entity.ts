import { Booster, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { UserBusiness } from "../user/user.business.entity";

@Entity({
  name : SchemaNames.delivery_deposits,
  database : Database.BOOSTER,
})
export class DeliveryDeposit extends BaseEntity {
  @ManyToOne(
    () => UserBusiness,
    business => business.deliveries,
    CHILD_CASCADE_OPTION
  )
  @JoinColumn({
    name : 'business',
  })
  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 36,
    nullable : false,
    primary : true
  })
  business : UserBusiness;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10,
    nullable : false,
    primary : true,
    comment : "상태 입금완료 배민 : status / "
  })
  status : string;
  
  @Column({
    type : 'tinyint',
    primary : true,
    comment : '배달의민족 : 0 / 요기요 : 1 / 쿠팡이츠 : 2'
  })
  type : number;


  @Column({
    type : 'date',
    nullable : false,
    primary : true,
    comment : "정산일 배민 : calDate / "
  })
  settle_date : Date;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 15,
    nullable : false,
    primary : true,
    comment : "배달의민족 | 배민1 배민 : service / "
  })
  service : string;

  @Column({
    type : 'tinyint',
    nullable : true,
    comment : '상태 배민 입금완료'
  })
  sub_status : number;

  @Column({
    type : "tinyint",
    nullable : false,
    comment : '0 : 배달의민족 , 1 : 배민1 , 2 : 요기요 , 3 : 쿠팡이츠'
  })
  service_type : number

  @Column({
    type : 'date',
    default : null,
    nullable : true,
    comment : "주문시작기간 배민 : orderSdate /"
  })
  order_start_date : string;

  @Column({
    type : 'date',
    default : null,
    nullable : true,
    comment : "주문종료기간 배민 : orderEdate /"
  })
  order_end_date : string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "입금금액 배민 : getAmt / "
  })
  settle_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "주문금액 배민 : orderAmt"
  })
  order_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "소액주문금액 배민 : smallOrderAmt"
  })
  small_order_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "배달팁 배민 : deliveryTip"
  })
  delivery_tip : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "사장님자체할인 배민 : discntAmt"
  })
  discount_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "포장금액? 배민 : takeoutAmt"
  })
  takeout_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "? 배민 : employeeAmt"
  })
  employee_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "주문중개이용료 배민 : mediFee"
  })
  medi_fee : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "서비스수수료 배민 : serviceFee"
  })
  service_fee : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "배달료 배민 : deliveryAmt"
  })
  delivery_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "배달 할인금액 배민 : deliveryDiscntAmt"
  })
  delivery_discount_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "외부결제수수료 배민 : extFee"
  })
  ext_fee : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "이미 현장에서 받으신 금액 배민 : offlineAmt"
  })
  offline_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "조정금액 배민 : adjAmt"
  })
  adj_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "기타 수수료 배민에서는 사용하지 않습니다."
  })
  etc_fee : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : "배민 : refundAmt / 쿠팡이츠 : returnAmt"
  })
  refund_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `고객할인금액 배민 : custDiscntAmt / 본사할인지원금금액 요기요 : headDiscntAmt`
  })
  customer_discount_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `배민 : storeDeliveryTip`
  })
  store_delivery_tip : number;

  @Column({
    type : 'date',
    default : null,
    nullable : true,
    comment : "배민 : extraAdSdate /"
  })
  extra_ad_start_date : string;

  @Column({
    type : 'date',
    default : null,
    nullable : true,
    comment : "배민 : extraAdEdate /"
  })
  extra_ad_end_date : string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `배민 : extraAdVat`
  })
  extra_ad_vat : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `배민 : extraAd`
  })
  extra_ad : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `배민 : addTax`
  })
  add_tax : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `배민 : adFee`
  })
  ad_fee : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `배민 : custDeliveryTip`
  })
  customer_delivery_tip : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `배민 : discntSupAmt`
  })
  discount_support_amount : number;
}