import { InternalServerErrorException } from "@nestjs/common";
import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { UserBusiness } from "../user/user.business.entity";

@Entity({
  name : SchemaNames.deliveries,
  database : Database.BOOSTER
})
@Index([
  'business',
  'type',
  'store_id',
  'order_division',
  'order_date',
  'order_no',
])
export class Delivery extends BaseEntity {
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
    type : 'tinyint',
    primary : true,
    comment : '배달의민족 : 0 / 요기요 : 1 / 쿠팡이츠 : 2'
  })
  type : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    primary : true,
    comment : `상호ID 배민 : storeId / `
  })
  store_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    primary : true,
    comment : `주문결과 배민 : orderDiv / `
  })
  order_division : string;

  @Column({
    type : 'tinyint',
    default : 0,
    nullable : true,
    comment : ' 1 : 성공 / 2 : 취소 / 3 : 처리중'
  })
  order_sub_division : number;

  @Column({
    type : 'datetime',
    primary : true,
    comment : `거래날짜+시간 배민 : orderDt + orderTm / `
  })
  @Index()
  order_date : Date;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    primary : true,
    comment : `주문번호 배민 : orderNo / `
  })
  order_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 200,
    default : null,
    nullable : true,
    comment : `주문내역 배민 : orderName / `
  })
  order_name : string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `주문금액 배민 : orderAmt / `
  })
  order_amount : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    default : null,
    nullable : true,
    comment : `배달종류 배민 : deliveryType / `
  })
  delivery_type : string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `배달료 배민 : deliveryAmt / `
  })
  delivery_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `소액주문금액 배민 : smallOrderAmt /`
  })
  small_order_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `포장주문금액 배민 : takeoutAmt / `
  })
  takeout_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `사장님자체할인금액/할인금액 배민 : discntAmt / `
  })
  discount_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `쿠폰금액 배민 : couponAmt / `
  })
  coupon_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `결제금액 배민 : payAmt / `
  })
  payment_amount : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    default : null,
    nullable : true,
    comment : `결제형태 배민 : payMet 바로결제 | 만나서결제 / `
  })
  payment_type : string;

  @Column({
    type : 'tinyint',
    default : 0,
    nullable : true,
    comment : '0 : none / 1 : 바로결제 / 2 : 만나서결제'
  })
  payment_sub_type : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `판매금액 배민 : salesAmt / `
  })
  sales_amount : number;

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
    comment : `차감금액 배민 : deductedAmt / `
  })
  deducted_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `주문중개수수료 배민 : orderFee / `
  })
  order_fee : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `배달 수수료 배민 : riderServiceFee [실제로는 0만 들어옴] / `
  })
  rider_fee : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `배달대행수수료 배민 : deliveryFee /`
  })
  delivery_fee : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `카드수수료 배민 : cardFee / `
  })
  card_fee : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `배달수수료할인금액 배민 : deliveryFeeDiscnt [실제로는 0만 들어옴] / `
  })
  delivery_fee_discount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `부가세 배민 : addTax /`
  })
  tax : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `가게 배달 팁 배민 : storeDeliveryTip /`
  })
  store_delivery_tip : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `고객배달팁 배민 : custDeliveryTip /`
  })
  cust_delivery_tip : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `일회용컵보증금액 배민 : cupFee /`
  })
  cup_fee : number;

  @Column({
    type : 'date',
    default : null,
    nullable : true,
    comment : `정산일자 배민 : settleDt /`
  })
  settle_date : Date;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `정산금액 배민 : settleAmt /`
  })
  settle_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : `대면결제금액 배민 : meetAmount / `
  })
  meet_amount : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 150,
    default : null,
    nullable : true,
    comment : `상호면 배민 : storeName / `
  })
  storeName : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 150,
    default : null,
    nullable : true,
    comment : `상호면 배민 : storeName / `
  })
  store_name : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    default : null,
    nullable : true,
    comment : `수령방법 배민 : adCampaign / `
  })
  campaign : string;

  @BeforeInsert()
  @BeforeUpdate()
  public stringToNumber() {
    try {
      if(this.order_amount) {
        this.order_amount = Number(this.order_amount) ? Number(this.order_amount) : 0;
      }
      if(this.delivery_amount) {
        this.delivery_amount = Number(this.delivery_amount) ? Number(this.delivery_amount) : 0;
      }
      if(this.small_order_amount) {
        this.small_order_amount = Number(this.small_order_amount) ? Number(this.small_order_amount) : 0;
      }
      if(this.takeout_amount) {
        this.takeout_amount = Number(this.takeout_amount) ? Number(this.takeout_amount) : 0;
      }
      if(this.discount_amount) {
        this.discount_amount = Number(this.discount_amount) ? Number(this.discount_amount) : 0;
      }
      if(this.coupon_amount) {
        this.coupon_amount = Number(this.coupon_amount) ? Number(this.coupon_amount) : 0;
      }
      if(this.payment_amount) {
        this.payment_amount = Number(this.payment_amount) ? Number(this.payment_amount) : 0;
      }
      if(this.sales_amount) {
        this.sales_amount = Number(this.sales_amount) ? Number(this.sales_amount) : 0;
      }
      if(this.customer_discount_amount) {
        this.customer_discount_amount = Number(this.customer_discount_amount) ? Number(this.customer_discount_amount) : 0;
      }
      if(this.deducted_amount) {
        this.deducted_amount = Number(this.deducted_amount) ? Number(this.deducted_amount) : 0;
      }
      if(this.order_fee) {
        this.order_fee = Number(this.order_fee) ? Number(this.order_fee) : 0;
      }
      if(this.rider_fee) {
        this.rider_fee = Number(this.rider_fee) ? Number(this.rider_fee) : 0;
      }
      if(this.delivery_fee) {
        this.delivery_fee = Number(this.delivery_fee) ? Number(this.delivery_fee) : 0;
      }
      if(this.card_fee) {
        this.card_fee = Number(this.card_fee) ? Number(this.card_fee) : 0;
      }
      if(this.delivery_fee_discount) {
        this.delivery_fee_discount = Number(this.delivery_fee_discount) ? Number(this.delivery_fee_discount) : 0;
      }
      if(this.tax) {
        this.tax = Number(this.tax) ? Number(this.tax) : 0;
      }
      if(this.settle_amount) {
        this.settle_amount = Number(this.settle_amount) ? Number(this.settle_amount) : 0;
      }
      if(this.meet_amount) {
        this.meet_amount = Number(this.meet_amount) ? Number(this.meet_amount) : 0;
      }
    } catch(e) {
      throw new InternalServerErrorException({
        message : 'Failed parseInt',
        payload : {
          result : null
        },
        status_code : 5005
      })
    }
  }

}