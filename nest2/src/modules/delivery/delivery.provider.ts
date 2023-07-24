import { InjectRepository } from "@nestjs/typeorm"
import { SchemaNames } from "src/constants/schema.names"
import { Delivery } from "src/entities/booster/delivery/delivery.entity"
import { UserBusiness } from "src/entities/booster/user/user.business.entity"
import { DeliveryType } from "src/enums/user/delivery/delivery"
import { ReportType } from "src/enums/user/report/report.type"
import { parseColonTime, parseDashDate } from "src/utils/date"
import { Repository } from "typeorm"
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity"

export class DeliveryProvider {
  static models = [
    Delivery
  ]
  private yogiyoPaymentSubType = {
    '바로결제' : 1, // 온라인
    '만나서결제' : 2,
    '라이더결제' : 1, // 온라인
    '온라인 결제' : 1, // 온라인
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

  public async yogiyoUpsert(
    business : UserBusiness,
    data : any
  ) {
    try {
      const orderAmt = Number(data['orderAmt']) ? Number(data['orderAmt']) : 0
      const delvieryAmt = Number(data['deliveryAmt']) ? Number(data['deliveryAmt']) : 0;
      const obj : QueryDeepPartialEntity<Delivery> = {
        business : business,
        type : DeliveryType.yogiyo, //parameter type
        store_id : data['storeId'],
        order_division : data['orderDiv'],
        order_sub_division : this.orderSubDivision[data['orderDiv']] ? this.orderSubDivision[data['orderDiv']] : 0,
        order_date : `${parseDashDate(data['orderDt'])} ${parseColonTime(data['orderTm'])}`,
        order_no : data['orderNo'],
        order_name : null, //요기요에 존재하지 않습니다.
        order_amount : orderAmt,
        delivery_type : null, // payMet으로 찾을 수 있지만 크게 사용되진 않아서 null로 넣습니다.
        delivery_amount : delvieryAmt,
        small_order_amount : 0,
        takeout_amount : 0,
        discount_amount : Number(data['discntAmt']) ? Number(data['discntAmt']) : 0,
        coupon_amount : 0,
        payment_amount : orderAmt + delvieryAmt,
        payment_type : data['payMet'] === '' ? null : data['payMet'],
        // 수단별
        payment_sub_type : this.yogiyoPaymentSubType[data['payMet']] ? this.yogiyoPaymentSubType[data['payMet']] : 0,
        sales_amount : orderAmt, // 요기요에는 salesAmt값이 없습니다.
        // headDiscntAmt 본사할인금액은 cutomer_discount_amount에 담습니다.
        customer_discount_amount : Number(data['headDiscntAmt']) ? Number(data['headDiscntAmt']) : 0,
        deducted_amount : 0, // 요기요에 차감금액은 없습니다.
        order_fee : 0, // 요기요에 주문중개 수수료는 없습니다.
        rider_fee : 0, // 요기요에 배달 수수료는 없습니다.
        delivery_fee : 0, // 요기요에 배달대행 수수료는 없습니다.
        card_fee : 0, // 요기요에 칻드 수수료는 없습니다.
        delivery_fee_discount : 0, // 요기요에 배달 수수료 할인금액은 없습니다.
        tax : 0, // 요기요에 부가세는 없습니다.
        // 새로 추가
        store_delivery_tip : 0,// 요기요에 주문중개 수수료는 없습니다.
        cust_delivery_tip : 0, // 요기요에 고객배달팁은 없습니다.
        cup_fee : 0, // 요기요에 일회용컵보증금액은 없습니다.
        settle_date : null, // 요기요에 정산 일자는 없습니다.
        settle_amount : 0, // 요기요에 주문중개 수수료는 없습니다.
        meet_amount : 0, // 요기요에 대면결제금액는 없습니다.
        storeName : data['storeName'] === '' ? null : data['storeName'] ,
        store_name : data['storeName'] === '' ? null : data['storeName'] ,
        campaign : null, // 요기요에 수령방법은 없습니다.
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
    } catch(e) {
      console.log(e)
    }
  }

  public async coupangEatsUpsert(
    business : UserBusiness,
    data : any,
  ) {
    try {
      const obj : QueryDeepPartialEntity<Delivery> = {
        business : business,
        type : DeliveryType.coupang_eats, //parameter type
        store_id : data['storeId'],
        order_division : data['orderDiv'],
        order_sub_division : this.orderSubDivision[data['orderDiv']] ? this.orderSubDivision[data['orderDiv']] : 0,
        order_date : `${parseDashDate(data['orderDt'])} ${parseColonTime(data['orderTm'])}`,
        order_no : data['orderNo'],
        order_name : data['orderName'],
        order_amount : Number(data['totalAmt']) ? Number(data['totalAmt']) : 0,
        delivery_type : data['deliveryType'] === '' ? null : data['deliveryType'],
        delivery_amount : Number(data['deliveryAmt']) ? Number(data['deliveryAmt']) : 0,
        small_order_amount : 0,
        takeout_amount : 0,
        discount_amount : Number(data['discntAmt']) ? Number(data['discntAmt']) : 0,
        coupon_amount : 0,
        payment_amount : Number(data['totalAmt']) ? Number(data['totalAmt']) : 0,
        // 수단별 쿠팡이츠는 온라인밖에 없습니다.
        payment_type : '바로결제',
        // 수단별 쿠팡이츠는 온라인밖에 없습니다.
        payment_sub_type : 1,
        sales_amount : Number(data['totalAmt']) ? Number(data['totalAmt']) : 0,
        customer_discount_amount : 0,
        deducted_amount : 0,
        order_fee : Number(data['orderFee']) ? Number(data['orderFee']) : 0,
        rider_fee : 0,
        delivery_fee : 0,
        card_fee : Number(data['cardFee']) ? Number(data['cardFee']) : 0,
        delivery_fee_discount : 0,
        tax : Number(data['addTax']) ? Number(data['addTax']) : 0,
        // 새로 추가
        store_delivery_tip : 0,
        cust_delivery_tip : 0,
        cup_fee : 0,
        //
        settle_date : data['settleDt'] === '' ? null : parseDashDate(data['settleDt']),
        settle_amount : Number(data['settleAmt']) ? Number(data['settleAmt']) : 0,
        meet_amount : 0,
        storeName : business.store_name,
        store_name : business.store_name,
        campaign : null,
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
    } catch(e) {
      console.log(e);
    }
  }

  public async kakaoSum(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    type : number
  ) {
    try {
      const format = {
        [ReportType.day] : '%Y-%m-%d',
        [ReportType.month] : '%Y-%m'
      }
      return await this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          `SUM(${SchemaNames.deliveries}.payment_amount) AS total`,
          `DATE_FORMAT(${SchemaNames.deliveries}.order_date , '${format[type]}') AS date`,
        ])
        .where(`${SchemaNames.deliveries}.business = :business` , {
          business : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.order_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
        .andWhere(`${SchemaNames.deliveries}.order_sub_division = :div` , {
          div : 1
        })
        .andWhere(`${SchemaNames.deliveries}.payment_sub_type = :payType` , {
          payType : 1
        })
        .groupBy('date')
        .getRawOne()
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async kakaoPurchaseSum(
    business : UserBusiness,
    date : string,
    type : number,
  ) {
    const format = {
      [ReportType.day] : '%Y-%m-%d',
      [ReportType.month] : '%Y-%m'
    }
    try {
      const query = this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          `${SchemaNames.deliveries}.type AS type`,
          `DATE_FORMAT(${SchemaNames.deliveries}.settle_date , '${format[type]}') AS settleDt `,
          `SUM(${SchemaNames.deliveries}.settle_amount) AS settleAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        if(type === ReportType.day) {
          query.andWhere(`${SchemaNames.deliveries}.settle_date = :date` , {
            date : date
          })
        } else {
          query.andWhere(`DATE_FORMAT(${SchemaNames.deliveries}.settle_date , '${format[type]}') = :date` , {
            date : date
          })
        }
        
        query.andWhere(`${SchemaNames.deliveries}.order_sub_division = :orderType` , {
            orderType : 1
          })
          .andWhere(`${SchemaNames.deliveries}.payment_sub_type = :subType` , {
            subType : 1
          })
      return await query
        .groupBy('type')
        .getRawMany();
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async findRecentOne(business : UserBusiness , type : number) : Promise<Delivery> {
    try {
      return await this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .where(`${SchemaNames.deliveries}.business = :business` , {
          business : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.type = :type` , {
          type : type
        })
        .orderBy('order_date' , 'DESC')
        .limit(1)
        .getOne()
    } catch(e) {  
      return null;
    }
  }

  public async findLastSettleDate(business : UserBusiness, type : number) {
    try {
      return await this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          `${SchemaNames.deliveries}.settle_date`
        ])
        .where(`${SchemaNames.deliveries}.business = :business` , {
          business : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.type = :type` , {
          type : type
        })
        .orderBy(`settle_date` , 'DESC')
        .limit(1)
        .getOne()
    } catch(e) {
      return null;
    }
  }
}