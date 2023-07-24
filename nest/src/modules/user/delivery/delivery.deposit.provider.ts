import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { DeliveryDeposit } from "src/entities/booster/delivery/delivery.deposit.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { DeliveryType } from "src/enums/user/delivery/delivery";
import { PaginationDto } from "src/modules/main/dto/pagination.dto";
import { parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class DeliveryDepositProvider {
  static models = [
    DeliveryDeposit
  ]

  private ServiceType = {
    '배달의민족' : 0,
    '배민포장주문' : 4,
    '배민1' : 1,
    '요기요' : 2,
    '쿠팡이츠' : 3,
  };

  private SubStatus = {
    '입금예정' : 0,
    '입금완료' : 1,
    '입금요청' : 2,
    '입금제외' : 3
  }

  constructor(
    @InjectRepository(DeliveryDeposit)
    private readonly deliveryDepositRepo : Repository<DeliveryDeposit>
  ){}

  public async baeminUpsert(
    business : UserBusiness,
    data : any
  ) {
    try {
      const obj : QueryDeepPartialEntity<DeliveryDeposit> = {
        business : business,
        type : DeliveryType.baemin,
        status : data['status'],
        settle_date : parseDashDate(data['calDate']),
        service : data['service'],
        sub_status : this.SubStatus[data['status']] ? this.SubStatus[data['status']] : 0,
        service_type : this.ServiceType[data['service']],
        order_start_date : parseDashDate(data['orderSdate']),
        order_end_date : parseDashDate(data['orderEdate']),
        settle_amount : Number(data['getAmt']) ? Number(data['getAmt']) : 0,
        order_amount : Number(data['orderAmt']) ? Number(data['orderAmt']) : 0,
        small_order_amount : Number(data['smallOrderAmt']) ? Number(data['smallOrderAmt']) : 0,
        delivery_tip : Number(data['deliveryTip']) ? Number(data['deliveryTip']) : 0,
        discount_amount : Number(data['discntAmt']) ? Number(data['discntAmt']) : 0,
        takeout_amount : Number(data['takeoutAmt']) ? Number(data['takeoutAmt']) : 0,
        employee_amount : Number(data['employeeAmt']) ? Number(data['employeeAmt']) : 0,
        medi_fee : Number(data['mediFee']) ? Number(data['mediFee']) : 0,
        service_fee : Number(data['serviceFee']) ? Number(data['serviceFee']) : 0,
        delivery_amount : Number(data['deliveryAmt']) ? Number(data['deliveryAmt']) : 0,
        delivery_discount_amount : Number(data['deliveryDiscntAmt']) ? Number(data['deliveryDiscntAmt']) : 0,
        ext_fee : Number(data['extFee']) ? Number(data['extFee']) : 0,
        offline_amount : Number(data['offlineAmt']) ? Number(data['offlineAmt']) : 0,
        adj_amount : Number(data['adjAmt']) ? Number(data['adjAmt']) : 0,
        etc_fee : 0,
        refund_amount : Number(data['refundAmt']) ? Number(data['refundAmt']) : 0,
        store_delivery_tip : Number(data['storeDeliveryTip']) ? Number(data['storeDeliveryTip']) : 0,
        customer_discount_amount : Number(data['custDiscntAmt']) ? Number(data['custDiscntAmt']) : 0,
        extra_ad_start_date : null,
        extra_ad_end_date : null,
        extra_ad_vat : Number(data['extraAdVat']) ? Number(data['extraAdVat']) : 0,
        extra_ad : Number(data['extraAd']) ? Number(data['extraAd']) : 0,
        add_tax : Number(data['addTax']) ? Number(data['addTax']) : 0,
        ad_fee : Number(data['adFee']) ? Number(data['adFee']) : 0,
        customer_delivery_tip : Number(data['custDeliveryTip']) ? Number(data['custDeliveryTip']) : 0,
        discount_support_amount : Number(data['discntSupAmt']) ? Number(data['discntSupAmt']) : 0,
      }
      await this.deliveryDepositRepo.createQueryBuilder()
        .insert()
        .into(DeliveryDeposit)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'business',
            'type',
            'settle_date',
            'order_division',
            'service',
          ],
          overwrite : [
            'status',
            'sub_status',
            'service_type',
            'order_start_date',
            'order_end_date',
            'settle_amount',
            'order_amount',
            'small_order_amount',
            'delivery_tip',
            'discount_amount',
            'takeout_amount',
            'employee_amount',
            'medi_fee',
            'service_fee',
            'delivery_amount',
            'delivery_discount_amount',
            'ext_fee',
            'offline_amount',
            'adj_amount',
            'etc_fee',
            'refund_amount',
            'store_delivery_tip',
            'customer_discount_amount',
            'extra_ad_start_date',
            'extra_ad_end_date',
            'extra_ad_vat',
            'extra_ad',
            'add_tax',
            'ad_fee',
            'customer_delivery_tip',
            'discount_support_amount'
          ]
        })
        .execute()
    } catch(e) {
      console.log(e);
    }
  }

  public async depositCalendar(
    business : UserBusiness,
    startDate : string,
    endDate : string
  ) {
    try {
      const query = this.deliveryDepositRepo.createQueryBuilder(SchemaNames.delivery_deposits)
        .select([
          `DATE_FORMAT(${SchemaNames.delivery_deposits}.settle_date , '%Y%m%d') AS settleDt`,
          `SUM(${SchemaNames.delivery_deposits}.settle_amount) AS settleAmt`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.delivery_deposits}.sub_status = :status` , {
          status :1
        })
        .andWhere(`${SchemaNames.delivery_deposits}.settle_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy('settleDt')
        .orderBy('settleDt' , 'ASC')
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async dayDepositDelivery(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    group : number
  ) {
    try {
      const query = this.deliveryDepositRepo.createQueryBuilder(SchemaNames.delivery_deposits)
        .select([
          group === 1 ?
          `${SchemaNames.delivery_deposits}.type AS type`:
          `DATE_FORMAT(${SchemaNames.delivery_deposits}.settle_date , '%Y%m%d') AS settleDt `,
          `SUM(
            CASE 
              WHEN ${SchemaNames.delivery_deposits}.sub_status = 1 
              THEN ${SchemaNames.delivery_deposits}.settle_amount 
            ELSE 0 END) AS settleAmt`, // 입금완료만 다 더함
          `COUNT(
            IF(
              ${SchemaNames.delivery_deposits}.sub_status=1,
              ${SchemaNames.delivery_deposits}.settle_amount,
              null
            )
          ) AS sumCnt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.delivery_deposits}.settle_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if(group === 0) return await query.groupBy('settleDt').orderBy('settleDt' , 'ASC').getRawMany();
      if(group === 1) return await query.groupBy('type').orderBy('type' , 'ASC').getRawMany();
      
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  public async depositDeliveryList(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    page : PaginationDto,
    service : number
  ) {
    try {
      const query = this.deliveryDepositRepo.createQueryBuilder(SchemaNames.delivery_deposits)
        .select([
          `DATE_FORMAT(${SchemaNames.delivery_deposits}.settle_date , '%Y%m%d') AS settleDt `,
          `${SchemaNames.delivery_deposits}.settle_amount AS settleAmt`,
          `${SchemaNames.delivery_deposits}.order_amount AS orderAmt`,
          `${SchemaNames.delivery_deposits}.service AS service`,
          `${SchemaNames.delivery_deposits}.type AS type`,
          `${SchemaNames.delivery_deposits}.sub_status as subStatus`,
          `${SchemaNames.delivery_deposits}.service_type as serviceType`,
          `${SchemaNames.delivery_deposits}.order_start_date as orderSdate`,
          `${SchemaNames.delivery_deposits}.order_end_date as orderEdate`,
          `${SchemaNames.delivery_deposits}.small_order_amount as smallOrderAmt`,
          `${SchemaNames.delivery_deposits}.delivery_tip as deliveryTip`,
          `${SchemaNames.delivery_deposits}.discount_amount as discntAmt`,
          `${SchemaNames.delivery_deposits}.takeout_amount as takeoutAmt`,
          `${SchemaNames.delivery_deposits}.employee_amount as employeeAmt`,
          `${SchemaNames.delivery_deposits}.medi_fee as mediFee`,
          `${SchemaNames.delivery_deposits}.service_fee as serviceFee`,
          `${SchemaNames.delivery_deposits}.delivery_amount as deliveryAmt`,
          `${SchemaNames.delivery_deposits}.delivery_discount_amount as deliveryDiscntAmt`,
          `${SchemaNames.delivery_deposits}.ext_fee as extFee`,
          `${SchemaNames.delivery_deposits}.offline_amount as offlineAmt`,
          `${SchemaNames.delivery_deposits}.adj_amount as adjAmt`,
          `${SchemaNames.delivery_deposits}.etc_fee as etcFee`,
          `${SchemaNames.delivery_deposits}.refund_amount as refundAmt`,
          `${SchemaNames.delivery_deposits}.customer_discount_amount as custDiscntAmt`,
          `${SchemaNames.delivery_deposits}.store_delivery_tip as storeDeliveryTip`,
          `${SchemaNames.delivery_deposits}.extra_ad_vat as extraAdVat`,
          `${SchemaNames.delivery_deposits}.extra_ad as extraAd`,
          `${SchemaNames.delivery_deposits}.add_tax as addTax`,
          `${SchemaNames.delivery_deposits}.ad_fee as adFee`,
          `${SchemaNames.delivery_deposits}.customer_delivery_tip as custDeliveryTip`,
          `${SchemaNames.delivery_deposits}.discount_support_amount as discntSupAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.delivery_deposits}.sub_status = 1`) // 입금완료
        .andWhere(`${SchemaNames.delivery_deposits}.settle_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if(service === 0 || service === 1 || service === 2) {
        query.andWhere(`${SchemaNames.delivery_deposits}.type = :service` , {
          service : service
        })
      }
      query
        .orderBy('settleDt' , 'ASC')
        // .offset(Number(page.count) * Number(page.page))
        // .limit(Number(page.count))
      return await query.getRawMany();
    } catch(e) {

      return null;
    }
  }

  public async findRecentOne(business : UserBusiness , type : number) : Promise<DeliveryDeposit> {
    try {
      return await this.deliveryDepositRepo.createQueryBuilder(SchemaNames.delivery_deposits)
        .where(`${SchemaNames.delivery_deposits}.business = :business` , {
          business : business.id
        })
        .andWhere(`${SchemaNames.deliveries}.type = :type` , {
          type : type
        })
        .orderBy('settle_date' , 'DESC')
        .limit(1)
        .getOne()
    } catch(e) {  
      return null;
    }
  }

  public async reportDepositDelivery(
    id : string,
    date : string | Date,
    group : number
  ) {
    const obj = {
      0 : '%Y-%m-%d', //day
      1 : '%Y-%m' //month
    }
    try {
      const query = this.deliveryDepositRepo.createQueryBuilder(SchemaNames.delivery_deposits)
        .select([
          `DATE_FORMAT(${SchemaNames.delivery_deposits}.settle_date , '${obj[group]}') AS settleDt `,
          `SUM(
            CASE 
              WHEN ${SchemaNames.delivery_deposits}.sub_status = 1 
              THEN ${SchemaNames.delivery_deposits}.settle_amount 
            ELSE 0 END) AS settleAmt`, // 입금완료만 다 더함
          `COUNT(
            IF(
              ${SchemaNames.delivery_deposits}.sub_status=1,
              ${SchemaNames.delivery_deposits}.settle_amount,
              null
            )
          ) AS sumCnt`,
        ])
        .where(`business = :bizId` , {
          bizId : id
        })
        .andWhere(`DATE_FORMAT(${SchemaNames.delivery_deposits}.settle_date , '${obj[group]}') = :date` , {
          date : date
        })
      return await query.groupBy('settleDt').orderBy('settleDt' , 'ASC').getRawOne();
      
    } catch(e) {
      console.log(e)
      return null;
    }
  }
}