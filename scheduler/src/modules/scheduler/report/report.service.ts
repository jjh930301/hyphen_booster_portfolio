import { Injectable, Logger } from "@nestjs/common";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CrefiaCardProvider } from "src/modules/booster/crefia.card.provider";
import { CrefiaPurchaseProvider } from "src/modules/booster/crefia.purchase.provider";
import { DeliveryProvider } from "src/modules/booster/delivery.provider";
import { HometaxCashSalesProvider } from "src/modules/booster/hometax.cash.sales.provider";
import { HometaxTaxProvider } from "src/modules/booster/hometax.tax.provider";
import { ReportProvider } from "./report.provider";
import { CreateReportVO } from './vo/create.report.vo';
import { ReportType } from 'src/enums/user/report/report.type';
import { Cron } from "@nestjs/schedule";
import { CronTime } from "src/constants/cron";
import { Constants } from "src/constants/constants";
import { UserProvider } from "src/modules/user/user.provider";
import { SelectHelper } from "src/helpers/select.helper";
import { User } from "src/entities/booster/user/user.entity";
import { AlertProvider } from "src/modules/user/alert.provider";
import { CreateAlertVO } from "src/modules/user/vo/create.alert.vo";
import { FcmType } from "src/constants/fcm.type";
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { FirebaseCloudMessage } from "src/utils/firebase.cloud.message";
import { moneyMasking } from "src/utils/masking";
import { CrefiaDepositProvider } from "src/modules/booster/crefia.deposit.provider";

@Injectable()
export class ReportService {

  private readonly logger = new Logger('Report scheduler');

  constructor(
    private readonly userPvd : UserProvider,
    private readonly reportPvd : ReportProvider,
    private readonly deliveryPvd : DeliveryProvider, // 배달 매출
    private readonly crefiaSalesPvd : CrefiaCardProvider, // 카드 매출
    private readonly cashSalesPvd : HometaxCashSalesProvider, // 현금 매출
    private readonly taxSalesPvd : HometaxTaxProvider, // 세금계산서 매출
    // private readonly purchasePvd : CrefiaPurchaseProvider, // 입금 예정
    private readonly depositPvd : CrefiaDepositProvider,
    private readonly purchasePvd : CrefiaPurchaseProvider,
    private readonly alertPvd : AlertProvider
  ){}

  @Cron(CronTime.daily_report , {
    name : 'daily_report',
    timeZone : 'Asia/Seoul'
  })
  async dailyCronJob() {
    if(Constants.RUNNABLE) {
      const users = await this.userPvd.joinAll();
      users.forEach((user) => {
        this.report(user , ReportType.day)
      })
    }
  }

  @Cron(CronTime.monthly_report , {
    name : 'monthly_report',
    timeZone : 'Asia/Seoul'
  })
  async monthlyCronJob() {
    if(Constants.RUNNABLE) {
      const users = await this.userPvd.joinAll();
      users.forEach((user) => {
        this.report(user , ReportType.month)
      })
    }
  }

  private report(user : User , type : number) {
    if(type === ReportType.day) {
      user.businesses.forEach((business) => {
        this.dailyReport(business , user.devices , user.kakao_alert)
      })
    }
    if(type === ReportType.month) {
      user.businesses.forEach((business) => {
        this.monthlyReport(business , user.devices , user.kakao_alert)
      })
    }
  }

  private async dailyReport(
    business : UserBusiness,
    devices : UserDevice[],
    kakaoAlert : boolean
  ) {
    try {
      // 전날 리포트
      let now1 = new Date(new Date().setHours(new Date().getHours() + 9));
      let now2 = new Date(new Date().setHours(new Date().getHours() + 9));
      const now = new Date(new Date().setHours(new Date().getHours() + 9)).toISOString();
      const nowStr = new Date(new Date().setHours(new Date().getHours() + 9)).toISOString();

      const beforeTwoDay = new Date(now1.setDate(new Date().getDate() -2)).toISOString();
      const beforeOneDay = new Date(now2.setDate(new Date().getDate() -1)).toISOString();

      const beforeTwo = `${beforeTwoDay.substring(0,4)}-${beforeTwoDay.substring(5,7)}-${beforeTwoDay.substring(8,10)}`
      const before = `${beforeOneDay.substring(0,4)}-${beforeOneDay.substring(5,7)}-${beforeOneDay.substring(8,10)}`;
      const nowString = `${nowStr.substring(0,4)}-${nowStr.substring(5,7)}-${nowStr.substring(8,10)}`;
      
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
      const per = () : number => {
        if(sales < beforeSales) {
          //감소
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

      const today = new Date().toISOString();
      const dashToday = `${today.substring(0,4)}-${today.substring(5,7)}-${today.substring(8,10)}`
      const expectedDelivery = await this.deliveryPvd.dayDepositDelivery(
        business , 
        dashToday,
        ReportType.day
      );
      
      const expectedPurchase = await this.purchasePvd.purchaseSum(
        business , 
        dashToday,
        ReportType.day
      );
      
      let expectedTotal = 0;
      if(expectedDelivery && expectedPurchase) {
        expectedTotal = (expectedDelivery['settleAmt'] ? Number(expectedDelivery['settleAmt']) : 0) 
        + (expectedPurchase['realAmt'] ? Number(expectedPurchase['realAmt']) : 0);
      }
      const vo = new CreateReportVO(
        ReportType.day,
        sales,
        beforeSales,
        expectedTotal,
        per(),
        nowString
      )
      const titleBody = FcmType.MESSAGE_TYPE[FcmType.DAILY_REPORT](
        // 알림 매출은 전일 날짜로
        `${beforeOneDay.substring(5,7)}월 ${beforeOneDay.substring(8,10)}일`,
        alertType,
        moneyMasking(sales),
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
            // fcm 알림은 매출은 전일 날짜로
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
      if(kakaoAlert) {
        // kakao alert
      } else {
        // fcm
      }
    } catch(e) {}
  }

  private async monthlyReport(
    business : UserBusiness,
    devices : UserDevice[],
    kakaoAlert : boolean
  ){
    try {
      const now = new Date(new Date().setHours(new Date().getHours() + 9));

      const beforeTwoMonth = new Date(now.setMonth(new Date().getMonth() -2)).toISOString();
      const beforeMonth = new Date(now.setMonth(new Date().getMonth() -1)).toISOString();
      
      const beforeTwo = `${beforeTwoMonth.substring(0,4)}-${beforeTwoMonth.substring(5,7)}`
      const before = `${beforeMonth.substring(0,4)}-${beforeMonth.substring(5,7)}`

      const firstDay = new Date(
        now.getFullYear(),
        new Date(new Date().setMonth(now.getMonth() + 1)).getMonth() , 
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
          if(sales < beforeSales) {
            //감소
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
            return (Math.round((sales / beforeSales) * 10000) / 100) -100;
          }
        } // save
        const split = firstDay.split('-')
        const expectedPurchase = await this.purchasePvd.purchaseSum(
          business,
          `${split[0]}-${split[1]}`,
          ReportType.month
        )
        const expectedDelivery = await this.deliveryPvd.dayDepositDelivery(
          business,
          `${split[0]}-${split[1]}`,
          ReportType.month
        )
        let expectedTotal = 0;
        if(expectedDelivery) {
          expectedTotal = (expectedDelivery['settleAmt'] ? Number(expectedDelivery['settleAmt']) : 0)
        }
        if(expectedPurchase) {
          expectedTotal = (expectedPurchase['realAmt'] ? Number(expectedPurchase['realAmt']) : 0)
        }
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
          moneyMasking(sales),
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
              {
                business_id : business.id,
                date : `${before}-01`
              },
              device.token
            );
          }
        })
        // 1차에서 제외
        // if(kakaoAlert) {
        //   // kakao alert
        // } else {
        //   // fcm
        // }
      }
    } catch(e) {
      console.log(e);
    }
  }
}