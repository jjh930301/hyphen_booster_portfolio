import { Injectable } from '@nestjs/common';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { ReportType } from 'src/enums/user/report/report.type';
import { ServiceData } from 'src/models';
import { DateRangeDto } from 'src/modules/main/dto/date.range.dto';
import { CrefiaCardProvider } from 'src/modules/user/crefia/crefia.card.provider';
import { CrefiaDepositProvider } from 'src/modules/user/crefia/crefia.deposit.provider';
import { CrefiaPurchaseProvider } from 'src/modules/user/crefia/crefia.purchase.provider';
import { DeliveryDepositProvider } from 'src/modules/user/delivery/delivery.deposit.provider';
import { DeliveryProvider } from 'src/modules/user/delivery/delivery.provider';
import { HometaxCashSalesProvider } from 'src/modules/user/hometax/hometax.cash.sales.provider';
import { HometaxTaxProvider } from 'src/modules/user/hometax/hometax.tax.provider';
import { ReportProvider } from 'src/modules/user/report/report.provider';
import { CreateReportVO } from 'src/modules/user/report/vo/create.report.vo';
import { parseDashDate , parseDate} from 'src/utils/date';

@Injectable()
export class Report2Service {
  constructor(
    private readonly crefiaDepositPvd : CrefiaDepositProvider,
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
    private readonly crefiaSalesPvd : CrefiaCardProvider,
    private readonly cashSalesPvd : HometaxCashSalesProvider,
    private readonly taxPvd : HometaxTaxProvider,
    private readonly delvieryPvd : DeliveryProvider,
    private readonly reportPvd : ReportProvider,
    private readonly crefiaPurchasePvd : CrefiaPurchaseProvider
  ){}

  public async updateReport(id : string) {
    try {
      const report = await this.reportPvd.findOne(id);
      const beforeTwoDay = new Date(new Date(report.date).setDate(new Date(report.date).getDate() -2)).toISOString();
      const beforeOneDay = new Date(new Date(report.date).setDate(new Date(report.date).getDate() -1)).toISOString();
      const beforeTwo = `${beforeTwoDay.substring(0,4)}-${beforeTwoDay.substring(5,7)}-${beforeTwoDay.substring(8,10)}`
      const before = `${beforeOneDay.substring(0,4)}-${beforeOneDay.substring(5,7)}-${beforeOneDay.substring(8,10)}`
      const obj = {
        [beforeTwo] : 0,
        [before] : 0
      }
      
      // 매출
      const delivery = await this.delvieryPvd.reportSalesSum(
        String(report.business), 
        beforeTwo,
        `${before} 23:59:59`,
        ReportType.day
      )
      delivery.forEach((item) => {
        obj[item.date] = obj[item.date] + Number(item.total)
      })
      const card = await this.crefiaSalesPvd.reportSalesSum(
        String(report.business) , 
        beforeTwo,
        `${before} 23:59:59`,
        ReportType.day
      )
      card.forEach((item) => {
        obj[item.date] = obj[item.date] + Number(item.total)
      })
      const cash = await this.cashSalesPvd.reportSalesSum(
        String(report.business) , 
        beforeTwo,
        `${before} 23:59:59`,
        ReportType.day
      )
      cash.forEach((item) => {
        obj[item.date] = obj[item.date] + Number(item.total)
      })
      const tax = await this.taxPvd.reportSalesSum(
        String(report.business) , 
        beforeTwo,
        `${before} 23:59:59`,
        ReportType.day
      )
      tax.forEach((item) => {
        obj[item.date] = obj[item.date] + Number(item.total)
      })
      let alertType : number;
      const keys = Object.keys(obj)
      const beforeSales : number = obj[keys[0]];
      const sales : number = obj[keys[1]]; // save
      // 전일과 당일 판매 금액이 없는 경우
      if(beforeSales !== 0 && sales !== 0) {
        const per = () : number => {
          //감소
          if(sales < beforeSales) {
            alertType = 2;
            if(sales === 0) {
              return 100
            }
            return Math.round(((sales / beforeSales) - 1) * 10000) / 100;
          } else if(sales === beforeSales) {
            alertType = 3;
            return 0
          } else {
            //증가
            alertType = 1;
            if(beforeSales === 0) {
              return -100
            }
            return (Math.round((sales / beforeSales) * 10000) / 100) -100;
          }
        } // save
        console.log(per())

        const today = report.date.toISOString();
        const dashToday = `${today.substring(0,4)}-${today.substring(5,7)}-${today.substring(8,10)}`
        const expectedDelivery = await this.deliveryDepositPvd.reportDepositDelivery(
          String(report.business) , 
          dashToday,
          0
        );
        
        const expectedPurchase = await this.crefiaDepositPvd.reportDeepositDate(
          String(report.business) , 
          dashToday,
          0
        );
        
        let expectedTotal = 0;
        if(expectedDelivery) {
          expectedTotal = (expectedDelivery['settleAmt'] ? Number(expectedDelivery['settleAmt']) : 0)
        }
        if(expectedPurchase) {
          expectedTotal = (expectedPurchase['realAmt'] ? Number(expectedPurchase['realAmt']) : 0)
        }
        const vo = new CreateReportVO(
          ReportType.day,
          sales,
          beforeSales,
          expectedTotal,
          per(),
          null
        )
        await this.reportPvd.updateOne(id , vo);
        return ServiceData.ok("Successfully changed data" , {result : true} , 2101)
      }
      return ServiceData.ok("Sales or before sales are 0" , {result : false} , 2102)
    } catch(e){
      console.log(e)
      return ServiceData.serverError();
    }
  }

  public async purchase(
    business : UserBusiness,
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const crefiaPurchases = this.crefiaPurchasePvd.dayPurchase(
        business , 
        startDate , 
        endDate , 
        1 , 
        null
      );
      const deliveryPurchase = this.delvieryPvd.expectedPurchase(
        business,
        startDate,
        endDate,
        1,
        1
      )
      return ServiceData.ok(
        "Successfully getting purchase report",
        {
          purchase : {
            crefia: await crefiaPurchases,
            delivery : await deliveryPurchase
          }
        }
      )
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async deposit(
    business : UserBusiness,
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const crefiaDeposit = this.crefiaDepositPvd.depositDate(
        business,
        startDate,
        `${endDate} 23:59:59`,
        1
      );
      const deliveryDeposit = this.deliveryDepositPvd.dayDepositDelivery(
        business,
        startDate,
        `${endDate} 23:59:59`,
        1
      )
      return ServiceData.ok(
        "Successfully getting deposit report",
        {
          deposit : {
            crefia : await crefiaDeposit,
            delivery : await deliveryDeposit
          },
          
        },
        2101
      )
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async sales(
    business : UserBusiness,
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const beforeStart = parseDashDate(parseDate(new Date(new Date(startDate).getTime() - (24*60*60*1000))));
      const beforeEnd = parseDashDate(parseDate(new Date(new Date(endDate).getTime() - (24*60*60*1000))));
      const sum = async (
        cards : string,
        hometaxCash : string,
        hometaxBill : string,
        deliveries : string
      ) : Promise<number> => {
        let crefia = cards ? Number(cards) : 0 
        let cash = hometaxCash ? Number(hometaxCash) : 0 
        let bill = hometaxBill ? Number(hometaxBill) : 0 
        let delivery = deliveries ? Number(deliveries) : 0 
        return crefia + cash + bill + delivery
      }
      const per = (sales , beforeSales) : string => {
          //감소
        if(sales < beforeSales) {
          if(sales === 0) {
            return '100.0'
          }
          return String(Number(Math.round(((sales / beforeSales) - 1) * 10000) / 100).toFixed(1));
        } else if(sales === beforeSales) {
          return '0'
        } else {
          if(beforeSales === 0) {
            return '-100.0'
          }
          //증가
          return String(Number((Math.round((sales / beforeSales) * 10000) / 100) -100).toFixed(1));
        }
      }
      const beforeCrefia = await this.crefiaSalesPvd.dateSum(
        business,
        beforeStart,
        `${beforeEnd} 23:59:59`,
      )
      const beforeCash = await this.cashSalesPvd.dateSum(
        business,
        beforeStart,
        `${beforeEnd} 23:59:59`
      );
      const beforeBill = await this.taxPvd.dateSum(
        business,
        beforeStart,
        `${beforeEnd} 23:59:59`,
      )
      const beforeDelivery = await this.delvieryPvd.dateSum(
        business,
        beforeStart,
        `${beforeEnd} 23:59:59`,
      )
      const crefiaSales = await this.crefiaSalesPvd.dateSum(
        business,
        startDate,
        `${endDate} 23:59:59`,
      )
      const cashSales = await this.cashSalesPvd.dateSum(
        business,
        startDate,
        `${endDate} 23:59:59`
      );
      const taxBill = await this.taxPvd.dateSum(
        business,
        startDate,
        `${endDate} 23:59:59`,
      )
      const deliverySales = await this.delvieryPvd.dateSum(
        business,
        startDate,
        `${endDate} 23:59:59`,
      )
      const beforeSum = await sum(beforeCrefia,beforeCash,beforeBill,beforeDelivery);
      const todaySum = await sum(crefiaSales,cashSales,taxBill,deliverySales);
      const percent : string = await per(todaySum,beforeSum)
      return ServiceData.ok(
        "Successfully getting sales report",
        {
          before : beforeSum,
          today : todaySum,
          per : percent,
          sales : {
            crefia : crefiaSales ? crefiaSales : '0',
            cash : cashSales ? cashSales : '0',
            bill : taxBill ? taxBill : '0',
            delivery : deliverySales ? deliverySales : '0'
          }
        }
      )
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  private async salesSum(
    business : UserBusiness,
    startDate,
    endDate
  ) : Promise<Object> {
    try {
      let obj : Object = {};
      const start = new Date(startDate);
      const end = new Date(endDate);
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
      const cashSales = await this.cashSalesPvd.calendar(
        business ,
        startDate , 
        `${endDate} 23:59:59`
      )
      cashSales.forEach((cash) => {
        obj[cash['trDt']] = obj[cash['trDt']] + Number(cash['totAmt'])
      })
      const taxes = await this.cashSalesPvd.calendar(
        business ,
        startDate , 
        `${endDate} 23:59:59`
      )
      taxes.forEach((tax) => {
        obj[tax['makeDt']] = obj[tax['makeDt']] + Number(tax['totAmt'])
      })
      const deliveries = await this.delvieryPvd.salesCalendar(
        business ,
        startDate , 
        `${endDate} 23:59:59`,
        0
      )
      deliveries.forEach((delivery) => {
        obj[delivery['orderDt']] = obj[delivery['orderDt']] + Number(delivery['payAmt'])
      })
      return obj
    } catch(e) {
      return null
    }
  }

  public async day(
    business : UserBusiness,
    date : DateRangeDto
  ) {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const startOneWeek = parseDashDate(parseDate(new Date(new Date(startDate).getTime() - (7*24*60*60*1000))));
      const endOneWeek = parseDashDate(parseDate(new Date(new Date(endDate).getTime() - (7*24*60*60*1000))));
      const beforeDay : Object = await this.salesSum(business , startOneWeek , endOneWeek)
      const thisDay : Object = await this.salesSum(business , startDate , endDate)
      return ServiceData.ok(
        "Successfully getting day statistics",
        {
          before : Object.values(beforeDay)[0],
          this : Object.values(thisDay)[0]
        }
      )
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async monthlyStack(
    business : UserBusiness,
    date : DateRangeDto
  ) {
    try {
      // const startDate = new Date(Number(date.start_date.substring(0,4)) , Number(date.start_date.substring(4,6)) , 1);
      // const endDate = parseDashDate(date.end_date);
      // console.log(date.start_date.substring(0,4) , Number(date.start_date.substring(4,6)));
      const startDate = new Date(parseDashDate(date.start_date));
      const start = new Date(startDate.getFullYear() , startDate.getMonth() , 1).toISOString().split('T')[0];
      const endDate = new Date(parseDashDate(date.end_date));
      const end = new Date(endDate.getFullYear() , endDate.getMonth() +1 , 0).toISOString().split('T')[0];
      const crefiaSales = await this.crefiaSalesPvd.dateSum(
        business , 
        start , 
        `${end} 23:59:59`
      );
      const cashSales = await this.cashSalesPvd.dateSum(
        business , 
        start , 
        `${end} 23:59:59`
      )
      const bill = await this.taxPvd.dateSum(
        business , 
        start , 
        `${end} 23:59:59`,
      )
      const delivery = await this.delvieryPvd.dateSum(
        business , 
        start , 
        `${end} 23:59:59`,
      )
      return ServiceData.ok(
        "Successfully getting monthly data",
        {
          crefia : crefiaSales ? crefiaSales : '0',
          cash : cashSales ? cashSales : '0',
          bill : bill ? bill : '0',
          delivery : delivery ? delivery : '0'
        },
        2101
      )
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
