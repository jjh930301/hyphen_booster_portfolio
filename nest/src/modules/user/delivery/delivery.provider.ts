import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsArray } from "class-validator";
import { SchemaNames } from "src/constants/schema.names";
import { Delivery } from "src/entities/booster/delivery/delivery.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { DeliveryType } from "src/enums/user/delivery/delivery";
import { ReportType } from "src/enums/user/report/report.type";
import { StatisticsSelectHelper } from "src/helpers/select/statistics.select.helper";
import { PaginationDto } from "src/modules/main/dto/pagination.dto";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class DeliveryProvider {
  static models = [
    Delivery
  ]

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

  public async dateStatistics(
    business : UserBusiness,
    type : number,
    startDate : string,
    endDate : string,
  ) {
    try {
      return await this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select(StatisticsSelectHelper.deliverySalesDate(SchemaNames.deliveries , type))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.order_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        // 취소까지 전부다 보여줘야 합니다.
        // .andWhere(`${SchemaNames.deliveries}.order_sub_division = :orderType` , {
        //   orderType : 1
        // })
        // .andWhere(`${SchemaNames.deliveries}.payment_sub_type = :subType` , {
        //   subType : 1
        // })
        .groupBy('date')
        .orderBy('date' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async timeStatistics(
    business : UserBusiness,
    startDate : string,
    endDate : string,
  ) {
    try {
      return await this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select(StatisticsSelectHelper.deliverySalesDayOrTime(SchemaNames.deliveries , 0))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.order_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        // .andWhere(`${SchemaNames.deliveries}.order_sub_division = :orderType` , {
        //   orderType : 1
        // })
        // .andWhere(`${SchemaNames.deliveries}.payment_sub_type = :subType` , {
        //   subType : 1
        // })
        .groupBy('time')
        .orderBy('time' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async dayStatistics(
    business : UserBusiness,
    startDate : string,
    endDate : string,
  ) {
    try {
      return await this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select(StatisticsSelectHelper.deliverySalesDayOrTime(SchemaNames.deliveries , 1))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.order_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        // .andWhere(`${SchemaNames.deliveries}.order_sub_division = :orderType` , {
        //   orderType : 1
        // })
        // .andWhere(`${SchemaNames.deliveries}.payment_sub_type = :subType` , {
        //   subType : 1
        // })
        .groupBy('day')
        .orderBy('day' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async deliveryStatistics(
    business : UserBusiness,
    startDate : string,
    endDate : string,
  ) {
    try {
      const onOff = this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          `${SchemaNames.deliveries}.payment_sub_type AS onOff`, // 온라인 , 오프라인
          `SUM(
            IF(
              ${SchemaNames.deliveries}.sales_amount != 0,
              ${SchemaNames.deliveries}.sales_amount,
              ${SchemaNames.deliveries}.order_amount
            )
          ) AS orderAmt`,
          `SUM(${SchemaNames.deliveries}.payment_amount) AS payAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.order_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.deliveries}.order_sub_division = :orderType` , {
          orderType : 1
        })
        .andWhere(`${SchemaNames.deliveries}.payment_sub_type != :subType` , {subType : 0})
        .groupBy('onOff')
        .orderBy('onOff' , 'ASC')
        .getRawMany()

      const deliveryType = this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          `${SchemaNames.deliveries}.type AS type`,
          `SUM(${SchemaNames.deliveries}.order_amount) AS orderAmt`,
          `SUM(${SchemaNames.deliveries}.payment_amount) AS payAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.order_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.deliveries}.order_sub_division = :orderType` , {
          orderType : 1
        })
        .andWhere(`${SchemaNames.deliveries}.payment_sub_type != :subType` , {subType : 0})
        .groupBy('type')
        .orderBy('type' , 'ASC')
        .getRawMany()
      return {
        online_offline : await onOff,
        delivery_type : await deliveryType
      }
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async salesCalendar(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    type : number
  ) {
    try {
      const query = this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          `DATE_FORMAT(${SchemaNames.deliveries}.order_date , '%Y%m%d') AS orderDt `,
          `SUM(${SchemaNames.deliveries}.payment_amount) AS payAmt`,
          `SUM(
            IF(
              ${SchemaNames.deliveries}.sales_amount != 0,
              ${SchemaNames.deliveries}.sales_amount,
              ${SchemaNames.deliveries}.order_amount
            )
          ) AS orderAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.order_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.deliveries}.order_sub_division = :orderType` , {
          orderType : 1
        })
        .andWhere(`${SchemaNames.deliveries}.payment_sub_type = :subType` , {
          subType : 1
        })
      // 캘린더는 온라인 결제만
      // if(type === 1) {
      //   query.andWhere(`
      //     ${SchemaNames.deliveries}.payment_sub_type = 1 OR 
      //     ${SchemaNames.deliveries}.payment_sub_type = 3 OR 
      //     ${SchemaNames.deliveries}.payment_sub_type = 4
      //   `)
      // }
      // if(type === 2) {
      //   query.andWhere(`
      //     ${SchemaNames.deliveries}.payment_sub_type = 2 OR 
      //     ${SchemaNames.deliveries}.payment_sub_type = 5 OR 
      //     ${SchemaNames.deliveries}.payment_sub_type = 6
      //   `)
      // }
      return await query
        .groupBy('orderDt')
        .orderBy('orderDt' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async expectedPurchase(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    type : number,
    group : number
  ) : Promise<Delivery[]> {
    try {
      const query = this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          // group === 1 ? 
          `${SchemaNames.deliveries}.type AS type` , // 타입별
          `DATE_FORMAT(${SchemaNames.deliveries}.settle_date , '%Y%m%d') AS settleDt `,
          `SUM(${SchemaNames.deliveries}.settle_amount) AS settleAmt`,
          `SUM(
            IF(
              ${SchemaNames.deliveries}.sales_amount != 0,
              ${SchemaNames.deliveries}.sales_amount,
              ${SchemaNames.deliveries}.order_amount
            )
          ) AS orderAmt`,
          `SUM(
            IF(
              ${SchemaNames.deliveries}.order_sub_division = 1,
              ${SchemaNames.deliveries}.order_fee,
              0
            ) +
            IF(
              ${SchemaNames.deliveries}.order_sub_division = 1,
              ${SchemaNames.deliveries}.rider_fee,
              0
            ) + 
            IF(
              ${SchemaNames.deliveries}.order_sub_division = 1,
              ${SchemaNames.deliveries}.delivery_fee,
              0
            ) + 
            IF(
              ${SchemaNames.deliveries}.order_sub_division = 1,
              ${SchemaNames.deliveries}.card_fee,
              0
            )
          ) AS feeAmt`,
          `SUM(${SchemaNames.deliveries}.payment_amount) AS payAmt`,
          `COUNT(
            IF(
              ${SchemaNames.deliveries}.order_sub_division=1,
              ${SchemaNames.deliveries}.order_amount,
              null
            )
          ) AS sumCnt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.settle_date is not null`)
        .andWhere(`${SchemaNames.deliveries}.settle_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        // 1 온라인 결제 , 2 오프라인 결제
      if(type === 1) {
        query.andWhere(`
          ${SchemaNames.deliveries}.payment_sub_type = 1 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 3 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 4
        `)
      }
      if(type === 2) {
        query.andWhere(`
          ${SchemaNames.deliveries}.payment_sub_type = 2 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 5 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 6
        `)
      }
      if(group === 0) return await query.groupBy('settleDt').addGroupBy('type').orderBy('settleDt' , 'ASC').getRawMany();
      if(group === 1) return await query.groupBy('type').orderBy('type' , 'ASC').getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async expectedPurchaseList(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    page : PaginationDto,
    type : number,
    service : number
  ) {
    try {
      const query = await this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          `DATE_FORMAT(${SchemaNames.deliveries}.settle_date , '%Y%m%d') AS settleDt `,
          `${SchemaNames.deliveries}.settle_amount AS settleAmt`,
          `(
            IF(
              ${SchemaNames.deliveries}.sales_amount != 0,
              ${SchemaNames.deliveries}.sales_amount,
              ${SchemaNames.deliveries}.order_amount
            )
          ) AS orderAmt`,
          `${SchemaNames.deliveries}.payment_amount AS payAmt`,
          `${SchemaNames.deliveries}.order_name AS orderName`,
          `${SchemaNames.deliveries}.order_division AS orderDiv`,
          `${SchemaNames.deliveries}.payment_type AS payMet`,
          `${SchemaNames.deliveries}.type AS type`,
          // `IF(
          //   ${SchemaNames.deliveries}.order_sub_division = 1,
          //   ${SchemaNames.deliveries}.order_fee,
          //   0
          // ) +
          // IF(
          //   ${SchemaNames.deliveries}.order_sub_division = 1,
          //   ${SchemaNames.deliveries}.rider_fee,
          //   0
          // ) + 
          // IF(
          //   ${SchemaNames.deliveries}.order_sub_division = 1,
          //   ${SchemaNames.deliveries}.delivery_fee,
          //   0
          // ) + 
          // IF(
          //   ${SchemaNames.deliveries}.order_sub_division = 1,
          //   ${SchemaNames.deliveries}.card_fee,
          //   0
          // ) as fee`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.settle_date is not null`)
        .andWhere(`${SchemaNames.deliveries}.settle_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if(service === 0 || service === 1 || service === 2) {
        query.andWhere(`${SchemaNames.deliveries}.type = :service` , {
          service : service
        })
      }
      if(type === 1) {
        query.andWhere(`
          ${SchemaNames.deliveries}.payment_sub_type = 1 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 3 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 4
        `)
      }
      if(type === 2) {
        query.andWhere(`
          ${SchemaNames.deliveries}.payment_sub_type = 2 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 5 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 6
        `)
      }
      query
        .orderBy('settleDt' , 'ASC')
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async purchaseCalendar(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    type : number
  ) {
    try {
      const query = this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          `DATE_FORMAT(${SchemaNames.deliveries}.settle_date , '%Y%m%d') AS settleDt `,
          `SUM(${SchemaNames.deliveries}.settle_amount) AS settleAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.settle_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.deliveries}.order_sub_division = :orderType` , {
          orderType : 1
        })
        .andWhere(`${SchemaNames.deliveries}.payment_sub_type = :subType` , {
          subType : 1
        })

      // 캘린더는 온라인결제만 fix
      // if(type === 1) {
      //   query.andWhere(`
      //     ${SchemaNames.deliveries}.payment_sub_type = 1 OR 
      //     ${SchemaNames.deliveries}.payment_sub_type = 3 OR 
      //     ${SchemaNames.deliveries}.payment_sub_type = 4
      //   `)
      // }
      // if(type === 2) {
      //   query.andWhere(`
      //     ${SchemaNames.deliveries}.payment_sub_type = 2 OR 
      //     ${SchemaNames.deliveries}.payment_sub_type = 5 OR 
      //     ${SchemaNames.deliveries}.payment_sub_type = 6
      //   `)
      // }
      return await query
        .groupBy('settleDt')
        .orderBy('settleDt' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async dateSum(
    business : UserBusiness,
    startDate : string,
    endDate : string
  ) {
    try {
      const query = this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          `SUM(
            CASE 
              WHEN ${SchemaNames.deliveries}.order_sub_division = 1 
              THEN ${SchemaNames.deliveries}.payment_amount 
            ELSE 0 END) AS payAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.order_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.deliveries}.payment_sub_type = :type` , {
          type : 1
        })
      const data = await query.getRawOne()
      return data['payAmt']
    } catch(e) {
      return null;
    }
  }

  public async dayDelivery(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    type : number,
    group : number //0 : 날짜기분 , 1 : 타입별로
  ) {
    try {
      const query = this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          group === 1 ? 
          `${SchemaNames.deliveries}.type AS type` : // 타입별
          `DATE_FORMAT(${SchemaNames.deliveries}.order_date , '%Y%m%d') AS orderDt `, // 날짜기준
          `SUM(
            CASE 
              WHEN ${SchemaNames.deliveries}.order_sub_division = 1 and ${SchemaNames.deliveries}.sales_amount != 0 
              THEN ${SchemaNames.deliveries}.sales_amount 
              WHEN ${SchemaNames.deliveries}.order_sub_division = 1 and ${SchemaNames.deliveries}.sales_amount = 0 
              THEN ${SchemaNames.deliveries}.order_amount 
            ELSE 0 END) AS orderAmt`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.deliveries}.order_sub_division = 1 
              THEN ${SchemaNames.deliveries}.payment_amount 
            ELSE 0 END) AS payAmt`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.deliveries}.order_sub_division = 2 
              THEN ${SchemaNames.deliveries}.payment_amount 
            ELSE 0 END) AS canAmt`,
          
          `SUM(
            IF(
              ${SchemaNames.deliveries}.order_sub_division = 1,
              ${SchemaNames.deliveries}.order_fee,
              0
            ) +
            IF(
              ${SchemaNames.deliveries}.order_sub_division = 1,
              ${SchemaNames.deliveries}.rider_fee,
              0
            ) + 
            IF(
              ${SchemaNames.deliveries}.order_sub_division = 1,
              ${SchemaNames.deliveries}.delivery_fee,
              0
            ) + 
            IF(
              ${SchemaNames.deliveries}.order_sub_division = 1,
              ${SchemaNames.deliveries}.card_fee,
              0
            )
          ) AS feeAmt`,
          `COUNT(IF(order_sub_division=1,payment_amount,null)) AS apprSumCnt`,
          `COUNT(IF(order_sub_division=2,payment_amount,null)) AS canSumCnt`,
          `COUNT(payment_amount) AS totCnt`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.order_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      // 1 온라인 결제 , 2 오프라인 결제
      if(type === 1) {
        query.andWhere(`
          ${SchemaNames.deliveries}.payment_sub_type = 1 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 3 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 4
        `)
      }
      if(type === 2) {
        query.andWhere(`
          ${SchemaNames.deliveries}.payment_sub_type = 2 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 5 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 6
        `)
      }
      if(group === 0) {
        return await query.groupBy(`orderDt`).orderBy('orderDt' , 'ASC').getRawMany();
      }
      if(group === 1) {
        return await query.groupBy(`type`).orderBy('type' , 'ASC').getRawMany();
      }
    } catch(e) {
      return null;
    }
  }

  public async dayDeliveries(
    business : UserBusiness,
    startDate : string | null = null,
    endDate : string | null = null,
    page : PaginationDto,
    type : number | null = null, // 1 온라인 / 2 오프라인
    service : string, // [배민 , 요기요 , 쿠팡이츠]
    orderType : number | null = null, // 1 성공 / 2 취소 / 3 처리중
    word : string | null = null,
  ) : Promise<Delivery[]> {
    try {
      const query = this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          `${SchemaNames.deliveries}.type As type`, // 0 배민 1 요기요 2 쿠팡이츠
          `${SchemaNames.deliveries}.order_date AS orderDt`, // 주문 시간
          `${SchemaNames.deliveries}.order_no AS orderNo`, // 주문 번호
          `${SchemaNames.deliveries}.order_division AS orderDiv`, // 주문 결과
          `${SchemaNames.deliveries}.payment_amount AS payAmt`, // 주문 금액 => 결제 금액
          `${SchemaNames.deliveries}.order_amount AS orderAmt`, // 주문 금액 => 결제 금액
          `IF(
            ${SchemaNames.deliveries}.sales_amount != 0,
            ${SchemaNames.deliveries}.sales_amount,
            ${SchemaNames.deliveries}.order_amount
          ) AS salesAmt`,
          `${SchemaNames.deliveries}.campaign AS adCampaign`, // 광고상품 그룹
          `${SchemaNames.deliveries}.payment_type AS payMet`, //결제 타입
          `IFNULL(${SchemaNames.deliveries}.delivery_type , '포장') AS deliveryType`, // 수령방법
          `${SchemaNames.deliveries}.order_name AS orderName`, // 주문 내역
          `${SchemaNames.deliveries}.delivery_amount AS deliveryAmt`,
          `${SchemaNames.deliveries}.settle_date AS settleDt`,
          `${SchemaNames.deliveries}.settle_amount AS settleAmt`,
          `${SchemaNames.deliveries}.order_fee AS orderFee`, // 주문 수수료
          `${SchemaNames.deliveries}.rider_fee AS riderFee`, // 라이더 수수료
          `${SchemaNames.deliveries}.delivery_fee AS deliverFee`, // 배달 수수료
          `${SchemaNames.deliveries}.card_fee AS cardFee`, // 카드 수수료
          `${SchemaNames.deliveries}.delivery_fee_discount AS deliverFeeDiscount`, // 배달 수수료 할인
          `${SchemaNames.deliveries}.customer_discount_amount AS custDiscntAmt`,
          `${SchemaNames.deliveries}.tax AS tax`,
          `${SchemaNames.deliveries}.cust_delivery_tip AS custDeliveryTip`, // 배달 수수료 할인
          `${SchemaNames.deliveries}.cup_fee AS cupFee`,
          `${SchemaNames.deliveries}.store_delivery_tip AS storeDeliveryTip`,
          `${SchemaNames.deliveries}.deducted_amount AS deductedAmt`, 
          `${SchemaNames.deliveries}.small_order_amount AS smallOrderAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })

      if(startDate != null && endDate != null) {
        query.andWhere(`${SchemaNames.deliveries}.order_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      if(service) {
        const services = JSON.parse(service) as Array<string>;
        if(Array.isArray(services)) {
          let serviceOrString = '';
          await Promise.all(services.map((service , i) => {
            if(i === 0) {
              serviceOrString += `${SchemaNames.deliveries}.type = ${Number(service)} `
            } else {
              serviceOrString += `OR ${SchemaNames.deliveries}.type = ${Number(service)} `
            }
          }))
          query.andWhere(serviceOrString)
        } else {
          query.andWhere(`${SchemaNames.deliveries}.type = ${Number(service)}`)
        }
      }
      if(word) {
        let like = `${SchemaNames.deliveries}.order_no LIKE :word `
        if(Number(word)) {
          like += `OR CAST(${SchemaNames.deliveries}.order_amount AS CHAR) LIKE :word `;
        }
        query.andWhere(`(${like})` , {
          word : `%${word}%`
        })
      }
      if(orderType) {
        query.andWhere(`${SchemaNames.deliveries}.order_sub_division = :orderType` , {
          orderType : orderType
        })
      }
      // 1 온라인 결제 , 2 오프라인 결제
      if(type === 1) {
        query.andWhere(`
          ${SchemaNames.deliveries}.payment_sub_type = 1 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 3 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 4
        `)
      }
      if(type === 2) {
        query.andWhere(`
          ${SchemaNames.deliveries}.payment_sub_type = 2 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 5 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 6
        `)
      }
      
      
      query
        .orderBy('orderDt' , 'ASC')
        // .offset(Number(page.count) * Number(page.page))
        // .limit(Number(page.count))
      return await query.getRawMany();
    } catch(e) {
      return [];
    }
  }

  public async rangeSum(
    business : UserBusiness,
    startDate : string | null = null,
    endDate : string | null = null,
    type : number | null = null, // 1 온라인 / 2 오프라인
    service : string, // [배민 , 요기요 , 쿠팡이츠]
    orderType : number | null = null, // 1 성공 / 2 취소 / 3 처리중
    word : string | null = null,
  ) : Promise<Delivery[]> {
    try {
      
      const query = this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          // `SUM(${SchemaNames.deliveries}.order_amount) AS orderTotal`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.deliveries}.order_sub_division = 1 
              THEN ${SchemaNames.deliveries}.payment_amount 
            ELSE 0 END) AS total`,
          `SUM(
            CASE
              WHEN ${SchemaNames.deliveries}.order_sub_division = 1 and ${SchemaNames.deliveries}.payment_sub_type = 1
              THEN ${SchemaNames.deliveries}.payment_amount 
            ELSE 0 END
          ) AS onlineTotal`,
          `SUM(
            CASE
              WHEN ${SchemaNames.deliveries}.order_sub_division = 1 and ${SchemaNames.deliveries}.payment_sub_type = 2
              THEN ${SchemaNames.deliveries}.payment_amount 
            ELSE 0 END
          ) AS offlineTotal`,
          `COUNT(
            IF(
              ${SchemaNames.deliveries}.order_sub_division = 1,
              ${SchemaNames.deliveries}.order_sub_division,
              null
            )
          ) AS success`,
          `COUNT(
            IF(
              ${SchemaNames.deliveries}.order_sub_division = 2,
              ${SchemaNames.deliveries}.order_sub_division,
              null
            )
          ) AS failure`,
          `COUNT(${SchemaNames.deliveries}.order_sub_division) AS allCnt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        
      if(startDate != null && endDate != null) {
        query.andWhere(`${SchemaNames.deliveries}.order_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      if(service) {
        const services = JSON.parse(service) as Array<string>;
        if(Array.isArray(services)) {
          let serviceOrString = '';
          await Promise.all(services.map((service , i) => {
            if(i === 0) {
              serviceOrString += `${SchemaNames.deliveries}.type = ${Number(service)} `
            } else {
              serviceOrString += `OR ${SchemaNames.deliveries}.type = ${Number(service)} `
            }
          }))
          query.andWhere(serviceOrString)
        } else {
          query.andWhere(`${SchemaNames.deliveries}.type = ${Number(service)}`)
        }
      }
      // 1 온라인 결제 , 2 오프라인 결제
      if(type === 1) {
        query.andWhere(`
          ${SchemaNames.deliveries}.payment_sub_type = 1 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 3 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 4
        `)
      }
      if(type === 2) {
        query.andWhere(`
          ${SchemaNames.deliveries}.payment_sub_type = 2 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 5 OR 
          ${SchemaNames.deliveries}.payment_sub_type = 6
        `)
      }
      if(orderType) {
        query.andWhere(`${SchemaNames.deliveries}.order_sub_division = :orderType` , {
          orderType : orderType
        })
      }
      if(word != null && typeof(Number(word)) === 'number') {
        const like = `
          ${SchemaNames.deliveries}.order_no LIKE :word 
          OR ${SchemaNames.deliveries}.order_amount LIKE :word 
        `
        query.andWhere(`(${like})` , {
          word : `%${word}%`
        })
      }
      const result = await query.getRawMany();
      return result[0]
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  public async reportSalesSum(
    business : string,
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
          business : business
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
        .orderBy('order_date' , 'DESC')
        .getRawMany()
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async salesSum(
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
        .groupBy('date')
        .orderBy('order_date' , 'DESC')
        .getRawMany()
    } catch(e) {
      console.log(e);
      return null;
    }
  }
  public async expectedPurchaseSum(
    business : UserBusiness,
    startDate : string,
    endDate : string
  ) {
    try {
      const query = this.deliveryRepo.createQueryBuilder(SchemaNames.deliveries)
        .select([
          `SUM(${SchemaNames.deliveries}.settle_amount) as total`
        ])
        .where(`${SchemaNames.deliveries}.business = :business` , {
          business : business.id
        })
      if(endDate !== null) {
        query.andWhere(`${SchemaNames.deliveries}.settle_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      } else {
        query.andWhere(`${SchemaNames.deliveries}.settle_date >= :start_date` , {
          start_date : startDate,
        })
      }
        
      return await query.getRawOne();
      
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  // type : 0 배민 , 1 요기요 , 2 쿠팡이츠
  public async findRecentOne(business : UserBusiness , type : number) : Promise<Delivery> {
    try {
      return await this.deliveryRepo.createQueryBuilder(SchemaNames.crefia_card)
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
}