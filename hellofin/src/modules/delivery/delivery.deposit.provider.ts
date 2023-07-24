import { InjectRepository } from "@nestjs/typeorm"
import { SchemaNames } from "src/constants/schema.names"
import { DeliveryDeposit } from "src/entities/booster/delivery/delivery.deposit.entity"
import { UserBusiness } from "src/entities/booster/user/user.business.entity"
import { DeliveryType } from "src/enums/user/delivery/delivery"
import { ReportType } from "src/enums/user/report/report.type"
import { parseDashDate } from "src/utils/date"
import { Repository } from "typeorm"
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity"

export class DeliveryDepositProvider {
  static models = [
    DeliveryDeposit
  ]
  private paymentSubType = {
    '바로결제' : 1, // 온라인
    '만나서결제' : 2,
    '라이더결제' : 1, // 온라인
    '온라인결제' : 1, // 온라인
    '현금' : 2,
    '신용카드' : 2
  }

  private ServiceType = {
    '배달의민족' : 0,
    '배민포장주문' : 4,
    '배민1' : 1,
    '요기요' : 2,
    '쿠팡이츠' : 3,
  };

  private orderSubDivision = {
    '성공' : 1,
    '취소' : 2,
    '처리중' : 3,
  }

  private SubStatus = {
    '입금예정' : 0,
    '입금완료' : 1,
    '입금요청' : 2,
    '입금제외' : 3
  }

  constructor(
    @InjectRepository(DeliveryDeposit)
    private readonly depositRepo : Repository<DeliveryDeposit>
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
      await this.depositRepo.createQueryBuilder()
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

  public async yogiyoUpsert(
    business : UserBusiness,
    data : any
  ) {
    try {
      const terminalFee = Number(data['terminalFee']) ? Number(data['terminalFee']) : 0
      const addFee = Number(data['addFee']) ? Number(data['addFee']) : 0
      const monthlyFee = Number(data['monthlyFee']) ? Number(data['monthlyFee']) : 0
      const unpaidCharge = Number(data['unpaidCharge']) ? Number(data['unpaidCharge']) : 0
      const obj : QueryDeepPartialEntity<DeliveryDeposit> = {
        business : business, //
        //required
        type : DeliveryType.yogiyo, //
        status : '입금완료', //
        //required
        settle_date : parseDashDate(data['calDate']), //
        service : '요기요',
        //required 요기요의 경우 입금 예정이 들어오지 않기 때문에 항상 1
        sub_status : this.SubStatus['입금완료'],
        service_type : this.ServiceType['요기요'],
        order_start_date : parseDashDate(data['orderSdate']), //
        order_end_date : parseDashDate(data['orderEdate']), //
        //required
        settle_amount : Number(data['getAmt']) ? Number(data['getAmt']) : 0, // 
        order_amount : Number(data['orderAmt']) ? Number(data['orderAmt']) : 0, //
        small_order_amount : 0,
        delivery_tip : 0,
        // 추가
        discount_amount : Number(data['discntAmt']) ? Number(data['discntAmt']) : 0, //
        takeout_amount : 0,
        employee_amount : 0,
        // 추가
        medi_fee : Number(data['mediFee']) ? Number(data['mediFee']) : 0, //
        // 추가
        service_fee : Number(data['serviceFee']) ? Number(data['serviceFee']) : 0, // 
        // 배민 delvieryAmt | 요기요 deliveryFee 
        // 추가
        delivery_amount : Number(data['deliveryFee']) ? Number(data['deliveryFee']) : 0, // 
        // 추가
        delivery_discount_amount : Number(data['deliveryDiscntAmt']) ? Number(data['deliveryDiscntAmt']) : 0, // 
        // 추가
        ext_fee : Number(data['extFee']) ? Number(data['extFee']) : 0, //
        offline_amount : Number(data['offlineAmt']) ? Number(data['offlineAmt']) : 0, // 
        // 일회용컵보증금
        adj_amount : Number(data['cupFee']) ? Number(data['cupFee']) : 0, 
        // 나머지 값들은 기타 차감금액으로
        etc_fee : terminalFee+addFee+monthlyFee+unpaidCharge
      }
      await this.depositRepo.createQueryBuilder()
        .insert()
        .into(DeliveryDeposit)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'business',
            'type',
            'settle_date',
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
            'etc_fee'
          ]
        })
        .execute()
    } catch(e) {
      console.log(e);
    }
  }

  public async coupangEatsUpsert(
    business : UserBusiness,
    data : any
  ) {
    try {
      const obj : QueryDeepPartialEntity<DeliveryDeposit> = {
        business : business,
        type : DeliveryType.coupang_eats,
        status : '입금완료',
        settle_date : parseDashDate(data['calDate']),
        service : '쿠팡이츠',
        sub_status : this.SubStatus['입금완료'],
        service_type : this.ServiceType['쿠팡이츠'],
        order_start_date : null,
        order_end_date : null,
        // 입금액
        settle_amount : Number(data['settlementAmt']) ? Number(data['settlementAmt']) : 0,
        // 판매 금액
        order_amount : Number(data['settlementList'][0]['salesAmt']) ? Number(data['settlementList'][0]['salesAmt']) : 0,
        small_order_amount : 0,
        delivery_tip : 0,
        discount_amount : 0,
        takeout_amount : 0,
        employee_amount : 0,
        medi_fee : 0,
        service_fee : 0,
        delivery_amount : 0,
        delivery_discount_amount : 0,
        ext_fee : 0,
        offline_amount : 0,
        // 잔액
        adj_amount : Number(data['balance']) ? Number(data['balance']) : 0,
        // 차감금액
        etc_fee : Number(data['settlementList'][0]['deductedAmt']) ? Number(data['settlementList'][0]['deductedAmt']) : 0
      }
      await this.depositRepo.createQueryBuilder()
        .insert()
        .into(DeliveryDeposit)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'business',
            'type',
            'settle_date',
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
            'etc_fee'
          ]
        })
        .execute()
    } catch(e) {
      console.log(e);
    }
  }

  public async kakaoDepositDelivery(
    business : UserBusiness,
    date : string,
    type : number
  ) {
    const format = {
      [ReportType.day] : '%Y-%m-%d', //day
      [ReportType.month] : '%Y-%m' //month
    }
    try {
      const query = this.depositRepo.createQueryBuilder(SchemaNames.delivery_deposits)
        .select([
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
          `${SchemaNames.delivery_deposits}.type AS type`,
          `${SchemaNames.delivery_deposits}.service AS service`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
      if(type === ReportType.day) {
        query.andWhere(`${SchemaNames.delivery_deposits}.settle_date = :date` , {
          date : date
        })
      } else {
        query.andWhere(`DATE_FORMAT(${SchemaNames.delivery_deposits}.settle_date , '${format[type]}') = :date` , {
          date : date
        })
      }
      return await query.groupBy('type').getRawMany();
      
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  public async findRecentOne(business : UserBusiness , type : number) : Promise<DeliveryDeposit> {
    try {
      return await this.depositRepo.createQueryBuilder(SchemaNames.delivery_deposits)
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
}