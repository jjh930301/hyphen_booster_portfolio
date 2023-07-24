import { Injectable } from '@nestjs/common';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { ServiceData } from 'src/models';
import { CrefiaCardProvider } from 'src/modules/user/crefia/crefia.card.provider';
import { CrefiaDepositProvider } from 'src/modules/user/crefia/crefia.deposit.provider';
import { CrefiaPurchaseProvider } from 'src/modules/user/crefia/crefia.purchase.provider';
import { DeliveryDepositProvider } from 'src/modules/user/delivery/delivery.deposit.provider';
import { DeliveryProvider } from 'src/modules/user/delivery/delivery.provider';
import { HometaxCashSalesProvider } from 'src/modules/user/hometax/hometax.cash.sales.provider';
import { HometaxTaxProvider } from 'src/modules/user/hometax/hometax.tax.provider';
import { parseDashDate, parseDate, parseDay, parseMonth } from 'src/utils/date';
import { DateRangeDto } from '../dto/date.range.dto';

@Injectable()
export class CalendarService {
  constructor(
    private readonly crefiaSalesPvd : CrefiaCardProvider,
    private readonly cashSalespvd : HometaxCashSalesProvider,
    private readonly hometaxPvd : HometaxTaxProvider,
    private readonly deliveryPvd : DeliveryProvider,
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
    private readonly crefiaPurchasePVd : CrefiaPurchaseProvider,
    private readonly crefiaDepositPvd : CrefiaDepositProvider,
  ) {}

  async salesCalendar(
    business : UserBusiness,
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      let obj : Object = {};
      const start = new Date(parseDashDate(date.start_date));
      const end = new Date(parseDashDate(date.end_date));
      // new Arrayobj
      for(start ; start <= end ; start.setDate(start.getDate() + 1)) {
        obj[parseDate(start)] = 0;
      }
      const cardSales = await this.crefiaSalesPvd.calendar(
        business ,
        startDate , 
        `${endDate} 23:59:59`
      );
      cardSales.forEach((card) => {
        obj[card['trDt']] = obj[card['trDt']] + Number(card['apprSumAmt'])
      })
      const cashSales = await this.cashSalespvd.calendar(
        business ,
        startDate , 
        `${endDate} 23:59:59`
      )
      cashSales.forEach((cash) => {
        obj[cash['trDt']] = obj[cash['trDt']] + Number(cash['totAmt'])
      })
      const taxes = await this.hometaxPvd.calendar(
        business ,
        startDate , 
        `${endDate} 23:59:59`
      )
      taxes.forEach((tax) => {
        obj[tax['makeDt']] = obj[tax['makeDt']] + Number(tax['totAmt'])
      })
      const deliveries = await this.deliveryPvd.salesCalendar(
        business ,
        startDate , 
        `${endDate} 23:59:59`,
        0
      )
      deliveries.forEach((delivery) => {
        obj[delivery['orderDt']] = obj[delivery['orderDt']] + Number(delivery['payAmt'])
      })
      return ServiceData.ok(
        'Successfully getting calendar' , 
        {
          calendar : obj
        } , 
        2101
      );
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async purchaseCalendar(
    business : UserBusiness,
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      let obj : Object = {};
      const start = new Date(parseDashDate(date.start_date));
      const end = new Date(parseDashDate(date.end_date));
      // new Arrayobj
      for(start ; start <= end ; start.setDate(start.getDate() + 1)) {
        obj[parseDate(start)] = 0;
      }
      const deliveries = await this.deliveryPvd.purchaseCalendar(
        business,
        startDate,
        `${endDate} 23:59:59`,
        0
      )
      deliveries.forEach((delivery) => {
        obj[delivery['settleDt']] = obj[delivery['settleDt']] + Number(delivery['settleAmt'])
      })
      const purchases = await this.crefiaPurchasePVd.calendar(
        business,
        startDate,
        `${endDate} 23:59:59`
      );
      purchases.forEach(purchase => {
        obj[purchase['payDt']] = obj[purchase['payDt']] + Number(purchase['payAmt'])
      })
      return ServiceData.ok(
        'Successfully getting expected purchase calendar',
        {
          calendar : obj
        },
        2101
      )
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async depositCalendar(
    business : UserBusiness,
    date : DateRangeDto
  ) {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      let obj : Object = {};
      const start = new Date(parseDashDate(date.start_date));
      const end = new Date(parseDashDate(date.end_date));
      // new Arrayobj
      for(start ; start <= end ; start.setDate(start.getDate() + 1)) {
        obj[parseDate(start)] = 0;
      }
      const cardDeposits = await this.crefiaDepositPvd.depositCalendar(
        business ,
        startDate , 
        `${endDate} 23:59:59`
      )
      cardDeposits.forEach(deposit => {
        obj[deposit['payDt']] = obj[deposit['payDt']] + Number(deposit['payAmt'])
      })

      const deliveryDeposits = await this.deliveryDepositPvd.depositCalendar(
        business,
        startDate,
        `${endDate} 23:59:59`,
      );
      deliveryDeposits.forEach(deposit => {
        obj[deposit['settleDt']] = obj[deposit['settleDt']] + Number(deposit['settleAmt'])
      })
      return ServiceData.ok(
        'Successfully getting deposit calendar',
        {
          calendar : obj
        },
        2101
      );
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
