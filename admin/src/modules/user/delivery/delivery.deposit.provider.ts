import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeliveryDeposit } from "src/entities/booster/delivery/delivery.deposit.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { DeliveryType } from "src/enums/user/delivery/delivery";
import { parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class DeliveryDepositProvider {
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
            'ad_fee'
          ]
        })
        .execute()
    } catch(e) {
      console.log('ㅁㄴㅇㄹ',e);
    }
  }
}