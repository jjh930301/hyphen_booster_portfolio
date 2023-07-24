import { Injectable } from '@nestjs/common';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { ServiceData } from 'src/models';
import { parseDashDate, parseDate } from 'src/utils/date';
import { DateRangeDto } from '../main/dto/date.range.dto';
import { CrefiaCardProvider } from '../user/crefia/crefia.card.provider';
import { DeliveryProvider } from '../user/delivery/delivery.provider';
import { HometaxCashSalesProvider } from '../user/hometax/hometax.cash.sales.provider';
import { HometaxTaxProvider } from '../user/hometax/hometax.tax.provider';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly crefiaSalesPvd : CrefiaCardProvider,
    private readonly cashSalespvd : HometaxCashSalesProvider,
    private readonly hometaxPvd : HometaxTaxProvider,
    private readonly deliveryPvd : DeliveryProvider
  ){}

  public async dateStatistics(
    business : UserBusiness,
    type : number,
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      let obj : Object = {};
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);

      const cashSales = await this.cashSalespvd.dateStatistics(
        business ,
        type,
        startDate , 
        `${endDate} 23:59:59`
      )
      cashSales.forEach((cash) => {
        obj[cash['date']] = {
          total : obj[cash['date']] ? obj[cash['date']]['total'] + Number(cash['total']) : Number(cash['total']) !== 0 ? Number(cash['total']) : 0,
          count : obj[cash['date']] ? obj[cash['date']]['count'] + Number(cash['count']) : Number(cash['count']) !== 0 ? Number(cash['count']) : 0
        }
      })
      
      const cardSales = await this.crefiaSalesPvd.dateStatistics(
        business ,
        type , 
        startDate, 
        `${endDate} 23:59:59`
      );
      cardSales.forEach((card) => {
        obj[card['date']] = {
          total : obj[card['date']] ? obj[card['date']]['total'] + Number(card['total']) : Number(card['total']) !== 0 ? Number(card['total']) : 0,
          count : obj[card['date']] ? obj[card['date']]['count'] + Number(card['count']) : Number(card['count']) !== 0 ? Number(card['count']) : 0,
        }
      })
      
      const taxes = await this.hometaxPvd.dateStatistics(
        business ,
        type,
        startDate , 
        `${endDate} 23:59:59`
      )
      taxes.forEach((tax) => {
        obj[tax['date']] = {
          total : obj[tax['date']] ? obj[tax['date']]['total'] + Number(tax['total']) : Number(tax['total']) !== 0 ? Number(tax['total']) : 0,
          count : obj[tax['date']] ? obj[tax['date']]['count'] + Number(tax['count']) : Number(tax['count']) !== 0 ? Number(tax['count']) : 0,
        }
      })
      const deliveries = await this.deliveryPvd.dateStatistics(
        business ,
        type ,
        startDate , 
        `${endDate} 23:59:59`
      )
      deliveries.forEach((delivery) => {
        obj[delivery['date']] = {
          total : obj[delivery['date']] ? obj[delivery['date']]['total'] + Number(delivery['total']) : Number(delivery['total']) !== 0 ? Number(delivery['total']) : 0,
          count : obj[delivery['date']] ? obj[delivery['date']]['count'] + Number(delivery['count']) : Number(delivery['count']) !== 0 ? Number(delivery['count']) : 0,
        }
      })
      return ServiceData.ok(
        'Successfully getting calendar' , 
        {
          statistics : obj
        } , 
        2101
      );
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async timeStatistics(
    business : UserBusiness,
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      let obj : Object = {};
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      for(let i = 0 ; i <= 23 ; i++) {
        obj[i] = {
          total : 0,
          count : 0
        };
      }
      const cashSales = await this.cashSalespvd.timeStatistics(
        business,
        startDate , 
        `${endDate} 23:59:59`
      );
      cashSales.forEach((cash) => {
        obj[cash['time']] = {
          total : obj[cash['time']] ? obj[cash['time']]['total'] + Number(cash['total']) : Number(cash['total']) !== 0 ? Number(cash['total']) : 0,
          count : obj[cash['time']] ? obj[cash['time']]['count'] + Number(cash['count']) : Number(cash['count']) !== 0 ? Number(cash['count']) : 0
        }
      })
      const cardSales = await this.crefiaSalesPvd.timeStatistics(
        business,
        startDate , 
        `${endDate} 23:59:59`
      )
      cardSales.forEach((card) => {
        obj[card['time']] = {
          total : obj[card['time']] ? obj[card['time']]['total'] + Number(card['total']) : Number(card['total']) !== 0 ? Number(card['total']) : 0,
          count : obj[card['time']] ? obj[card['time']]['count'] + Number(card['count']) : Number(card['count']) !== 0 ? Number(card['count']) : 0,
        }
      })
      // 수진님 기획서 상에 시간대별은 계산서가 제외되게 되어 있다고 함
      // const taxes = await this.hometaxPvd.timeStatistics(
      //   business ,
      //   startDate , 
      //   `${endDate} 23:59:59`
      // )
      // taxes.forEach((tax) => {
      //   obj[tax['time']] = {
      //     total : obj[tax['time']] ? obj[tax['time']]['total'] + Number(tax['total']) : Number(tax['total']) !== 0 ? Number(tax['total']) : 0,
      //     count : obj[tax['time']] ? obj[tax['time']]['count'] + Number(tax['count']) : Number(tax['count']) !== 0 ? Number(tax['count']) : 0,
      //   }
      // })
      const deliveries = await this.deliveryPvd.timeStatistics(
        business ,
        startDate , 
        `${endDate} 23:59:59`
      )
      deliveries.forEach((delivery) => {
        obj[delivery['time']] = {
          total : obj[delivery['time']] ? obj[delivery['time']]['total'] + Number(delivery['total']) : Number(delivery['total']) !== 0 ? Number(delivery['total']) : 0,
          count : obj[delivery['time']] ? obj[delivery['time']]['count'] + Number(delivery['count']) : Number(delivery['count']) !== 0 ? Number(delivery['count']) : 0,
        }
      })

      return ServiceData.ok(
        'Successfully getting time statistics' , 
        {
          statistics : obj
        } , 
        2101
      );
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async dayStatistics(
    business : UserBusiness,
    date : DateRangeDto
  ) {
    try {
      let obj : Object = {};
      const dayOfWeek = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      for(let i = 0 ; i < dayOfWeek.length ; i++) {
        obj[dayOfWeek[i]] = {
          total : 0,
          count : 0
        };
      }
      const cardSales = await this.crefiaSalesPvd.dayStatistics(
        business,
        startDate , 
        `${endDate} 23:59:59`
      )
      
      cardSales.forEach((card) => {
        obj[card['day']] = {
          total : obj[card['day']] ? obj[card['day']]['total'] + Number(card['total']) : Number(card['total']) !== 0 ? Number(card['total']) : 0,
          count : obj[card['day']] ? obj[card['day']]['count'] + Number(card['count']) : Number(card['count']) !== 0 ? Number(card['count']) : 0,
        }
      })
      const cashSales = await this.cashSalespvd.dayStatistics(
        business,
        startDate , 
        `${endDate} 23:59:59`
      );
      
      cashSales.forEach((cash) => {
        obj[cash['day']] = {
          total : obj[cash['day']] ? obj[cash['day']]['total'] + Number(cash['total']) : Number(cash['total']) !== 0 ? Number(cash['total']) : 0,
          count : obj[cash['day']] ? obj[cash['day']]['count'] + Number(cash['count']) : Number(cash['count']) !== 0 ? Number(cash['count']) : 0
        }
      })
      const taxes = await this.hometaxPvd.dayStatistics(
        business ,
        startDate , 
        `${endDate} 23:59:59`
      )
      
      taxes.forEach((tax) => {
        obj[tax['day']] = {
          total : obj[tax['day']] ? obj[tax['day']]['total'] + Number(tax['total']) : Number(tax['total']) !== 0 ? Number(tax['total']) : 0,
          count : obj[tax['day']] ? obj[tax['day']]['count'] + Number(tax['count']) : Number(tax['count']) !== 0 ? Number(tax['count']) : 0,
        }
      })
      const deliveries = await this.deliveryPvd.dayStatistics(
        business ,
        startDate , 
        `${endDate} 23:59:59`
      )
      
      deliveries.forEach((delivery) => {
        obj[delivery['day']] = {
          total : obj[delivery['day']] ? obj[delivery['day']]['total'] + Number(delivery['total']) : Number(delivery['total']) !== 0 ? Number(delivery['total']) : 0,
          count : obj[delivery['day']] ? obj[delivery['day']]['count'] + Number(delivery['count']) : Number(delivery['count']) !== 0 ? Number(delivery['count']) : 0,
        }
      })
      return ServiceData.ok(
        'Successfully getting day statistics' , 
        {
          statistics : obj
        } , 
        2101
      );
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async typeStatistics(
    business : UserBusiness,
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      let cashes = {
        total : 0,
        count : 0
      };
      let cards = {
        total : 0,
        count : 0
      };
      let bills = {
        total : 0,
        count : 0
      };
      let deliver = {
        total : 0,
        count : 0
      };
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const cashSales = await this.cashSalespvd.timeStatistics(
        business,
        startDate , 
        `${endDate} 23:59:59`
      );
      cashSales.forEach((cash) => {
        cashes.total += Number(cash['total']);
        cashes.count += Number(cash['count']);
      })
      const cardSales = await this.crefiaSalesPvd.timeStatistics(
        business,
        startDate , 
        `${endDate} 23:59:59`
      )
      cardSales.forEach((card) => {
        cards.total += Number(card['total']);
        cards.count += Number(card['count']);
      })
      const taxes = await this.hometaxPvd.timeStatistics(
        business ,
        startDate , 
        `${endDate} 23:59:59`
      )
      taxes.forEach((tax) => {  
        bills.total += Number(tax['total']);
        bills.count += Number(tax['count']);
      })
      const deliveries = await this.deliveryPvd.timeStatistics(
        business ,
        startDate , 
        `${endDate} 23:59:59`
      )
      deliveries.forEach((delivery) => {
        deliver.total += Number(delivery['total']);
        deliver.count += Number(delivery['count']);
      })
      return ServiceData.ok(
        'Successfully getting type statistics',
        {
          data : {
            card : cards,
            cash : cashes,
            bill : bills,
            delivery : deliver
          }
        },
        2101
      )
    } catch(e) {
      console.log(e);
      return ServiceData.serverError();
    }
  }

  public async deliveryStatistics(
    business : UserBusiness,
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const data = await this.deliveryPvd.deliveryStatistics(
        business,
        startDate,
        `${endDate} 23:59:59`
      )
      if(data)
        return ServiceData.ok(
          'Successfully getting delivery statistics',
          {
            delivery : data
          },
          2101
        )
        return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
