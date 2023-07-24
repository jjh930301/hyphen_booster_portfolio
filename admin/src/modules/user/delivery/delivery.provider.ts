import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Delivery } from "src/entities/booster/delivery/delivery.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { DeliveryType } from "src/enums/user/delivery/delivery";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class DeliveryProvider {
  private paymentSubType = {
    '바로결제' : 1, // 온라인
    '만나서결제' : 2,
    '라이더결제' : 1, // 온라인
    '온라인결제' : 1, // 온라인
    '현금' : 2,
    '신용카드' : 2
  }

  private orderSubDivision = {
    '성공' : 1,
    '취소' : 2,
    '처리중' : 3,
  }

  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepo : Repository<Delivery>
  ){}

  public async baeminUpsert(
    business : UserBusiness,
    data : any,
    type : number | null = null
  ) {
    try {
      if(this.orderSubDivision[data['orderDiv']] !== 3) {
        const obj : QueryDeepPartialEntity<Delivery> = {
          business : business,
          type : DeliveryType.baemin, //parameter type
          store_id : data['storeId'],
          order_division : data['orderDiv'],
          order_sub_division : this.orderSubDivision[data['orderDiv']] ? this.orderSubDivision[data['orderDiv']] : 0,
          order_date : `${parseDashDate(data['orderDt'])} ${parseColonTime(data['orderTm'])}`,
          order_no : data['orderNo'],
          order_name : data['orderName'],
          order_amount : Number(data['orderAmt']) ? Number(data['orderAmt']) : 0,
          delivery_type : data['deliveryType'] === '' ? null : data['deliveryType'],
          delivery_amount : Number(data['deliveryAmt']) ? Number(data['deliveryAmt']) : 0,
          small_order_amount : Number(data['smallOrderAmt']) ? Number(data['smallOrderAmt']) : 0,
          takeout_amount : Number(data['takeoutAmt']) ? Number(data['takeoutAmt']) : 0,
          discount_amount : Number(data['discntAmt']) ? Number(data['discntAmt']) : 0,
          coupon_amount : Number(data['couponAmt']) ? Number(data['couponAmt']) : 0,
          payment_amount : Number(data['payAmt']) ? Number(data['payAmt']) : 0,
          payment_type : data['payMet'] === '' ? null : data['payMet'],
          payment_sub_type : this.paymentSubType[data['payMet']] ? this.paymentSubType[data['payMet']] : 0,
          sales_amount : Number(data['salesAmt']) ? Number(data['salesAmt']) : 0,
          customer_discount_amount : Number(data['custDiscntAmt']) ? Number(data['custDiscntAmt']) : 0,
          deducted_amount : Number(data['deductedAmt']) ? Number(data['deductedAmt']) : 0,
          order_fee : Number(data['orderFee']) ? Number(data['orderFee']) : 0,
          rider_fee : Number(data['riderServiceFee']) ? Number(data['riderServiceFee']) : 0,
          delivery_fee : Number(data['deliveryFee']) ? Number(data['deliveryFee']) : 0,
          card_fee : Number(data['cardFee']) ? Number(data['cardFee']) : 0,
          delivery_fee_discount : Number(data['deliveryFeeDiscnt']) ? Number(data['deliveryFeeDiscnt']) : 0,
          tax : Number(data['addTax']) ? Number(data['addTax']) : 0,
          // 새로 추가
          store_delivery_tip : Number(data['storeDeliveryTip']) ? Number(data['storeDeliveryTip']) : 0,
          cust_delivery_tip : Number(data['custDeliveryTip']) ? Number(data['custDeliveryTip']) : 0,
          cup_fee : Number(data['cupFee']) ? Number(data['cupFee']) : 0,
          //
          settle_date : data['settleDt'] === '' ? null : data['settleDt'],
          settle_amount : Number(data['settleAmt']) ? Number(data['settleAmt']) : 0,
          meet_amount : Number(data['meetAmount']) ? Number(data['meetAmount']) : 0,
          storeName : data['storeName'] === '' ? null : data['storeName'] ,
          store_name : data['storeName'] === '' ? null : data['storeName'] ,
          campaign : data['adCampaign'] === '' ? null : data['adCampaign'],
        }
        await this.deliveryRepo.createQueryBuilder()
          .insert()
          .into(Delivery)
          .values(obj)
          .orUpdate({
            conflict_target : [
              'business',
              'type',
              'store_id',
              'order_division',
              'order_date',
              'order_no',
            ],
            overwrite : [
              'order_name',
              'order_amount',
              'order_division',
              'order_sub_division',
              'delivery_type',
              'delivery_amount',
              'small_order_amount',
              'takeout_amount',
              'discount_amount',
              'coupon_amount',
              'payment_amount',
              'payment_type',
              'payment_sub_type',
              'sales_amount',
              'customer_discount_amount',
              'deducted_amount',
              'order_fee',
              'rider_fee',
              'delivery_fee',
              'card_fee',
              'delivery_fee_discount',
              'tax',
              'store_delivery_tip',
              'cust_delivery_tip',
              'cup_fee',
              'settle_date',
              'settle_amount',
              'meet_amount',
              'storeName',
              'store_name',
              'campaign',
            ]
          })
          .execute()
      }
    } catch(e) {
      console.log(e);
    }
  }
}