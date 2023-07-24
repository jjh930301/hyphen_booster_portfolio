import { Injectable } from '@nestjs/common';
import { FcmType } from 'src/constants/fcm.type';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { UserDevice } from 'src/entities/booster/user/user.device.entity';
import { ReportType } from 'src/enums/user/report/report.type';
import { ServiceData } from 'src/models';
import { PaginationDto } from 'src/modules/main/dto/pagination.dto';
import { parseDashDate, parseDate } from 'src/utils/date';
import { FirebaseCloudMessage } from 'src/utils/firebase.cloud.message';
import { AlertProvider } from '../alert/alert.provider';
import { CreateAlertVO } from '../alert/vo/create.alert.vo';
import { CrefiaCardProvider } from '../crefia/crefia.card.provider';
import { CrefiaPurchaseProvider } from '../crefia/crefia.purchase.provider';
import { DeliveryDepositProvider } from '../delivery/delivery.deposit.provider';
import { DeliveryProvider } from '../delivery/delivery.provider';
import { HometaxCashSalesProvider } from '../hometax/hometax.cash.sales.provider';
import { HometaxTaxProvider } from '../hometax/hometax.tax.provider';
import { ReportProvider } from './report.provider';
import { CreateReportVO } from './vo/create.report.vo';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportPvd : ReportProvider,
    private readonly deliveryPvd : DeliveryProvider, // 배달 매출
    private readonly crefiaSalesPvd : CrefiaCardProvider, // 카드 매출
    private readonly cashSalesPvd : HometaxCashSalesProvider, // 현금 매출
    private readonly taxSalesPvd : HometaxTaxProvider, // 세금계산서 매출
    private readonly purchasePvd : CrefiaPurchaseProvider, // 입금 예정
    private readonly alertPvd : AlertProvider
  ){}

  public async reports(
    business : UserBusiness,
    page : PaginationDto,
    type : number
  ) : Promise<ServiceData> {
    try {
      const reports = await this.reportPvd.reports(business , page , type)
      if(reports) {
        return ServiceData.ok(
          'Successfully getting reports',
          {reports},
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async monthTest(
    business : UserBusiness,
    devices : UserDevice[]
  ) : Promise<ServiceData> {
    try {
      const now = new Date(new Date().setHours(new Date().getHours() + 9));

      const beforeTwoMonth = new Date(now.setMonth(new Date().getMonth() -2)).toISOString();
      const beforeMonth = new Date(now.setMonth(new Date().getMonth() -1)).toISOString();
      
      const beforeTwo = `${beforeTwoMonth.substring(0,4)}-${beforeTwoMonth.substring(5,7)}`
      const before = `${beforeMonth.substring(0,4)}-${beforeMonth.substring(5,7)}`

      const firstDay = new Date(
        Number(now.toISOString().substring(0,4)) ,
        Number(now.toISOString().substring(5,7)) , 
        1
      ).toISOString();
      const obj = {
        [beforeTwo] : 0,
        [before] : 0
      }
      const delivery = await this.deliveryPvd.salesSum(
        business,
        `${beforeTwo}-01`,
        firstDay,
        ReportType.month
      )
      delivery.forEach((item) => {
        obj[item.date] = obj[item.date] + Number(item.total)
      })
      const card = await this.crefiaSalesPvd.salesSum(
        business,
        `${beforeTwo}-01`,
        firstDay,
        ReportType.month
      )
      card.forEach((item) => {
        obj[item.date] = obj[item.date] + Number(item.total)
      })
      const cash = await this.cashSalesPvd.salesSum(
        business,
        `${beforeTwo}-01`,
        firstDay,
        ReportType.month
      )
      cash.forEach((item) => {
        obj[item.date] = obj[item.date] + Number(item.total)
      })
      const tax = await this.taxSalesPvd.salesSum(
        business,
        `${beforeTwo}-01`,
        firstDay,
        ReportType.month
      )
      tax.forEach((item) => {
        obj[item.date] = obj[item.date] + Number(item.total)
      })
      let alertType : number;
      const keys = Object.keys(obj)
      const beforeSales : number = obj[keys[0]]; //save
      const sales : number = obj[keys[1]]; // save
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
            return Math.round((sales / beforeSales) * 10000) / 100;
          }
        } // save

        const expectedPurchase = await this.purchasePvd.expectedPurchaseSum(
          business,
          firstDay,
          null
        )
        const expectedDelivery = await this.deliveryPvd.expectedPurchaseSum(
          business,
          firstDay,
          null
        )
        let expectedTotal = 0;
        expectedTotal = (expectedDelivery.total ? Number(expectedDelivery.total) : 0) 
          + (expectedPurchase.total ? Number(expectedPurchase.total) : 0);
        const vo = new CreateReportVO(
          ReportType.month,
          sales,
          beforeSales,
          expectedTotal,
          per(),
          `${before}-01`
        )
        const titleBody = FcmType.MESSAGE_TYPE[FcmType.MONTHLY_REPORT](
          `${beforeMonth.substring(5,7)}월`,
          alertType,
          sales,
          per() // alert
        )
        const alertVO = new CreateAlertVO(
          titleBody.title,
          titleBody.body,
          business.id,
          Number(FcmType.MONTHLY_REPORT),
          false,
        );

        await this.alertPvd.createAlert(business , alertVO);
        await this.reportPvd.createReport(business , vo);

        //fcm || kakao alert
        devices.forEach((device) => {
          if(device.token) {
            const fcm = FcmType.MESSAGE_TYPE[FcmType.MONTHLY_REPORT](
              `${beforeMonth.substring(5,7)}월`,
              0,//  fcm
            )
            FirebaseCloudMessage.report(
              fcm.title,
              fcm.body,
              FcmType.MONTHLY_REPORT,
              business.id,
              device.token
            );
          }
        })
      }
      return ServiceData.timeout();
    } catch(e) {
      console.log(e)
      return ServiceData.serverError();
    }
  }

  public async test(
    business : UserBusiness,
    devices : UserDevice[]
  ) : Promise<ServiceData> {
    try {
      // 전날 리포트
      const now = new Date(new Date().setHours(new Date().getHours() + 9));
      
      const beforeTwoDay = new Date(now.setDate(new Date().getDate() -2)).toISOString();
      const beforeOneDay = new Date(now.setDate(new Date().getDate() -1)).toISOString();

      const beforeTwo = `${beforeTwoDay.substring(0,4)}-${beforeTwoDay.substring(5,7)}-${beforeTwoDay.substring(8,10)}`
      const before = `${beforeOneDay.substring(0,4)}-${beforeOneDay.substring(5,7)}-${beforeOneDay.substring(8,10)}`
      // const beforeTwo = '2022-11-09';
      // const before = '2022-11-10'
      const obj = {
        [beforeTwo] : 0,
        [before] : 0
      }
      // 매출
      const delivery = await this.deliveryPvd.salesSum(
        business , 
        beforeTwo,
        `${before} 23:59:59`,
        ReportType.day
      )
      delivery.forEach((item) => {
        obj[item.date] = obj[item.date] + Number(item.total)
      })
      const card = await this.crefiaSalesPvd.salesSum(
        business , 
        beforeTwo,
        `${before} 23:59:59`,
        ReportType.day
      )
      card.forEach((item) => {
        obj[item.date] = obj[item.date] + Number(item.total)
      })
      const cash = await this.cashSalesPvd.salesSum(
        business , 
        beforeTwo,
        `${before} 23:59:59`,
        ReportType.day
      )
      cash.forEach((item) => {
        obj[item.date] = obj[item.date] + Number(item.total)
      })
      const tax = await this.taxSalesPvd.salesSum(
        business , 
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
              return beforeSales
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
            return Math.round((sales / beforeSales) * 10000) / 100;
          }
        } // save
  
        const today = new Date().toISOString();
        const dashToday = `${today.substring(0,4)}-${today.substring(5,7)}-${today.substring(8,10)}`
        const expectedDelivery = await this.deliveryPvd.expectedPurchaseSum(
          business , 
          dashToday,
          `${dashToday} 23:59:59`
        );
        
        const expectedPurchase = await this.purchasePvd.expectedPurchaseSum(
          business , 
          dashToday,
          `${dashToday} 23:59:59`
        );
        
        let expectedTotal = 0;
        expectedTotal = (expectedDelivery?.total ? Number(expectedDelivery?.total) : 0) 
          + (expectedPurchase?.total ? Number(expectedPurchase?.total) : 0);
        const vo = new CreateReportVO(
          ReportType.day,
          sales,
          beforeSales,
          expectedTotal,
          per(),
          before
        )
        const titleBody = FcmType.MESSAGE_TYPE[FcmType.DAILY_REPORT](
          `${beforeOneDay.substring(5,7)}월 ${beforeOneDay.substring(8,10)}일`,
          alertType,
          sales,
          per() // alert
        );
        const alertVO = new CreateAlertVO(
          titleBody.title,
          titleBody.body,
          business.id,
          Number(FcmType.DAILY_REPORT),
          false,
        );
        await this.alertPvd.createAlert(business , alertVO);
        await this.reportPvd.createReport(business , vo);
        devices.forEach((device) => {
          if(device.token && device.report_alert) {
            const fcm = FcmType.MESSAGE_TYPE[FcmType.DAILY_REPORT](
              `${beforeOneDay.substring(5,7)}월 ${beforeOneDay.substring(8,10)}일`,
              0,//  fcm
            );
            FirebaseCloudMessage.report(
              fcm.title,
              fcm.body,
              FcmType.DAILY_REPORT,
              {
                business_id : business.id,
                date : dashToday
              },
              device.token
            );
          }
        })
        // 1차에서는 제외
        // if(kakaoAlert) {
        //   // kakao alert
        // } else {
        //   // fcm
        // }
      }
      return ServiceData.timeout();
    } catch(e) {
      console.log(e);
      return ServiceData.serverError();
    }
  }
}
