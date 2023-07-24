import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Constants } from "src/constants/constants";
import { CronTime } from "src/constants/cron";
import { Endpoint } from "src/constants/endpoint";
import { Urls } from "src/constants/urls";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
import { ReportType } from "src/enums/user/report/report.type";
import { CustomHttp } from "src/models/custom.http";
import { CrefiaCardProvider } from "src/modules/booster/crefia.card.provider";
import { CrefiaDepositProvider } from "src/modules/booster/crefia.deposit.provider";
import { DeliveryProvider } from "src/modules/booster/delivery.provider";
import { DeliveryDepositProvider } from "src/modules/booster/delivery.deposit.provider";
import { HometaxCashSalesProvider } from "src/modules/booster/hometax.cash.sales.provider";
import { HometaxTaxProvider } from "src/modules/booster/hometax.tax.provider";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { moneyMasking } from "src/utils/masking";
import { ReportProvider } from "./report.provider";
import { CrefiaPurchaseProvider } from "src/modules/booster/crefia.purchase.provider";
import { DeliveryType } from "src/enums/user/delivery/delivery";
import { datetimeNow } from "src/utils/date";

@Injectable()
export class ReportV2Service {

  private readonly logger = new Logger('Report v2 scheduler');

  WEEKDAY = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

  constructor(
    private readonly userPvd : UserProvider,
    private readonly reportPvd : ReportProvider,
    private readonly deliveryPvd : DeliveryProvider, // 배달 매출
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
    private readonly crefiaSalesPvd : CrefiaCardProvider, // 카드 매출
    private readonly cashSalesPvd : HometaxCashSalesProvider, // 현금 매출
    private readonly taxSalesPvd : HometaxTaxProvider, // 세금계산서 매출
    // private readonly purchasePvd : CrefiaPurchaseProvider, // 입금 예정
    private readonly depositPvd : CrefiaDepositProvider,
    private readonly purchasePvd : CrefiaPurchaseProvider,
    private readonly alertPvd : AlertProvider
  ){}

  @Cron(CronTime.daily_kakao_alert , {
    name : 'daily_kakao_alert',
    timeZone : 'Asia/Seoul'
  })
  async dailyKakaoAlert() {
    if(Constants.RUNNABLE) {
      // Fixed 쿼리 변경 사업자가 아무것도 없을 때
      const users = await this.userPvd.findAccount(false , '7a22ec29-fe2a-483d-91b1-1ce17db7dbfb');
      users.forEach((user) => {
        if(user.kakao_alert) {
          this.report(user , ReportType.day)
        }
      })
      this.logger.log('daily kakao alert' , datetimeNow())
    }
  }

  @Cron(CronTime.monthly_kakao_alert , {
    name : 'monthly_kakao_alert',
    timeZone : 'Asia/Seoul'
  })
  async monthlyKakaoAlert() {
    if(Constants.RUNNABLE) {
      const users = await this.userPvd.findAccount(false);
      users.forEach((user) => {
        if(user.kakao_alert) {
          this.report(user , ReportType.month)
        }
      })
      this.logger.log('monthly kakao alert' , datetimeNow())
    }
  }

  // every monday
  @Cron(CronTime.none_account , {
    name : 'none_account_report',
    timeZone : 'Asia/Seoul'
  })
  async noneAccount() {
    if(Constants.RUNNABLE) {
      // Fixed 쿼리 변경 사업자가 아무것도 없을 때
      // const users = await this.userPvd.findAccount(true);
      // users.forEach((user) => {
      //   if(user.kakao_alert) {
      //     this.noneReport(user)
      //   }
      // })
    }
  }

  private report(user : User , type : number) {
    if(type === ReportType.day) {
      user.businesses.forEach((business) => {
        this.dailyReport(business , user.mobile)
      })
    }
    if(type === ReportType.month) {
      user.businesses.forEach((business) => {
        this.monthlyReport(business , user.mobile)
      })
    }
  }

  private noneReport(user : User) {
    if(user.businesses.length !== 0) {
      user.businesses.forEach(business => {
        this.noneReportSendBusiness(business , user.mobile)
      })
    }
  }

  private async noneReportSendBusiness(
    business : UserBusiness , 
    mobile : string
  ) {
    const today = new Date(new Date().setHours(new Date().getHours() + 9)).toISOString();
    let now1 = new Date(new Date().setHours(new Date().getHours() + 9));
      const now = new Date(new Date().setHours(new Date().getHours() + 9));
    const beforeOne = new Date(now.setDate(new Date().getDate() -1));
    const beforeOneDay = new Date(now1.setDate(new Date().getDate() -1)).toISOString();
    const weekday = new Date(new Date().setHours(new Date().getHours() + 9))
    try {
      let message = `
연결기관을 등록하시면 일일 리포트를 매일 받아 보실 수 있어요 📆 

☂ 사업장명: ${business.store_name}
☂ 기간: ${today.substring(5,7)}-${today.substring(8,10)} (${this.WEEKDAY[weekday.getDay()]})

◽ ${today.substring(5,7)}월 ${today.substring(8,10)}일 ${this.WEEKDAY[weekday.getDay()]} 오늘 입금 예정: 500,000원
└비씨카드: 200,000원
└신한카드: 100,000원
└하나카드: 100,000원
└배달의민족: 100,000원

◽ ${beforeOneDay.substring(5,7)}-${beforeOneDay.substring(8,10)}(${this.WEEKDAY[beforeOne.getDay()]}) 어제 매출: 230,000원
└카드: 100,000원
└현금영수증: 30,000원
└세금계산서: 50,000원
└배달(온라인 결제): 50,000원

◽ X월 누적 합계: 3,541,000원

5초 만에 연결할 수 있어요. 👇`
    // const http = new CustomHttp(Urls.MNWISE , {Authorization : Constants.MNWISE_KEY})
    // const data = await http.post(Endpoint.KAKAO_ALERT , {
    //   SEQ : `${business.id}_${Date.now()}`,
    //   RECEIVER : mobile, //user.mobile
    //   JONMUN : {
    //     SENDER_KEY : Constants.SENDER_KEY,
    //     TMPL_CD : "",
    //     SND_MSG : "message"
    //   }
    // })
    // console.log(data)
    } catch(e) {
      console.log(e)
    }
  }

  private async dailyReport(
    business : UserBusiness,
    mobile : string,
  ) {
    const deliveryType = {
      [DeliveryType.baemin] : '배달의민족',
      [DeliveryType.yogiyo] : '요기요',
      [DeliveryType.coupang_eats] : '쿠팡이츠',
    };
    try {
      const WEEKDAY = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
      // 전날 리포트
      let now1 = new Date(new Date().setHours(new Date().getHours() + 9));
      const now = new Date(new Date().setHours(new Date().getHours() + 9));
      const nowStr = new Date(new Date().setHours(new Date().getHours() + 9)).toISOString();
      const beforeOne = new Date(now.setDate(new Date().getDate() -1));
      const beforeOneDay = new Date(now1.setDate(new Date().getDate() -1)).toISOString();

      const before = `${beforeOneDay.substring(0,4)}-${beforeOneDay.substring(5,7)}-${beforeOneDay.substring(8,10)}`
      const weekday = new Date(new Date().setHours(new Date().getHours() + 9))
      let today = new Date(new Date().setHours(new Date().getHours() + 9)).toISOString();
      const dashToday = `${today.substring(0,4)}-${today.substring(5,7)}-${today.substring(8,10)}`
      const expectedDelivery = await this.deliveryPvd.kakaoPurchaseSum(
        business , 
        dashToday,
        ReportType.day
      );
      
      const expectedDeposit = await this.purchasePvd.kakaoPurchaseSum(
        business , 
        dashToday,
        ReportType.day
      );

      // 매출
      let beforeSales = 0;
      const card = await this.crefiaSalesPvd.kakaoSum(
        business , 
        before,
        `${before} 23:59:59`,
        ReportType.day
      ) // 카드
      if (card) beforeSales += Number(card['total'])
      const cash = await this.cashSalesPvd.kakaoSum(
        business , 
        before,
        `${before} 23:59:59`,
        ReportType.day
      ) // 현금영수증
      if (cash) beforeSales += Number(cash['total'])
      const tax = await this.taxSalesPvd.kakaoSum(
        business , 
        before,
        `${before} 23:59:59`,
        ReportType.day
      ) // 세금계산서
      if (tax) beforeSales += Number(tax['total'])
      const delivery = await this.deliveryPvd.kakaoSum(
        business , 
        before,
        `${before} 23:59:59`,
        ReportType.day
      )// 배달
      if (delivery) beforeSales += Number(delivery['total'])
      let expectTotal = 0;
      expectedDelivery.forEach(delivery => {
        if (delivery) {
          expectTotal += Number(delivery['settleAmt'])
        }
      })
      expectedDeposit.forEach(deposit => {
        if(deposit) {
          expectTotal += Number(deposit['realAmt'])
        }
      })
      let depositDetail : string = '';
      expectedDeposit.forEach(deposit => {
        if(deposit) {
          depositDetail += `└${deposit['card_company']} : ${moneyMasking(deposit['realAmt'])}원\n`
        }
      })

      expectedDelivery.forEach(delivery => {
        if (delivery) {
          depositDetail += `└${deliveryType[delivery['type']]} : ${moneyMasking(delivery['settleAmt'])}원\n`
        }
      })

      let yesterdaySalesDetail : string = '';
      if (card) {
        yesterdaySalesDetail += `└카드 : ${moneyMasking(card['total'])}원\n`
      } else {
        yesterdaySalesDetail += `└카드 : 0원\n`       
      }
      if (cash) {
        yesterdaySalesDetail += `└현금영수증 : ${moneyMasking(cash['total'])}원\n`
      } else {
        yesterdaySalesDetail += `└현금영수증 : 0원\n`       
      }
      if (tax) {
        yesterdaySalesDetail += `└세금계산서 : ${moneyMasking(tax['total'])}원\n`
      } else {
        yesterdaySalesDetail += `└세금계산서 : 0원\n`       
      }
      if (delivery) {
        yesterdaySalesDetail += `└배달(온라인 결제) : ${moneyMasking(delivery['total'])}원\n`
      } else {
        yesterdaySalesDetail += `└배달(온라인 결제) : 0원\n`       
      }

      let nextFirstDay = new Date(
        now.getFullYear(),
        new Date(new Date().setMonth(now.getMonth() + 1)).getMonth(), 
        1
      ).toISOString();
      // 매월 1일일 경우 전월의 매출 전체를 가지고옴
      if (today.substring(8,10) === '01') {
        nextFirstDay = today
        today = new Date(now.setMonth(new Date().getMonth() -1)).toISOString();
      }
      
      // 매출
      const strNextFirstDay = `${nextFirstDay.substring(0,4)}-${nextFirstDay.substring(5,7)}-${nextFirstDay.substring(8,10)}T00:00:00.000Z`
      let monthSales = 0;
      const monthCard = await this.crefiaSalesPvd.kakaoSum(
        business , 
        `${today.substring(0,4)}-${today.substring(5,7)}-01`,
        strNextFirstDay,
        ReportType.month
      ) // 카드
      if (monthCard) monthSales += Number(monthCard['total'])
      const monthCash = await this.cashSalesPvd.kakaoSum(
        business , 
        `${today.substring(0,4)}-${today.substring(5,7)}-01`,
        strNextFirstDay,
        ReportType.month
      ) // 현금영수증
      if (monthCash) monthSales += Number(monthCash['total'])
      const monthTax = await this.taxSalesPvd.kakaoSum(
        business , 
        `${today.substring(0,4)}-${today.substring(5,7)}-01`,
        strNextFirstDay,
        ReportType.month
      ) // 세금계산서
      if (monthTax) monthSales += Number(monthTax['total'])
      const monthDelivery = await this.deliveryPvd.kakaoSum(
        business , 
        `${today.substring(0,4)}-${today.substring(5,7)}-01`,
        strNextFirstDay,
        ReportType.month
      )// 배달
      if (monthDelivery) monthSales += Number(monthDelivery['total'])

      const message = `${today.substring(5,7)}월 ${today.substring(8,10)}일 일일 리포트\n\n어제 벌어들인 돈 한 번에 정리! 📈\n\n어제 매출 \n${moneyMasking(beforeSales)}원\n\n☂️ 사업장명: ${business.store_name}\n☂️ 기간: ${today.substring(5,7)}-${today.substring(8,10)}(${WEEKDAY[weekday.getDay()]})\n\n□ ${today.substring(5,7)}월 ${today.substring(8,10)}일(${WEEKDAY[weekday.getDay()]}) \n오늘 입금 예정: ${moneyMasking(expectTotal)}원 \n${depositDetail}\n\n□ ${beforeOneDay.substring(5,7)}월 ${beforeOneDay.substring(8,10)}일(${WEEKDAY[beforeOne.getDay()]}) \n어제 매출: ${moneyMasking(beforeSales)}원 \n${yesterdaySalesDetail} \n\n□ ${today.substring(5,7)}월  누적 합계: ${moneyMasking(monthSales)} 원\n\n시간대 분석 등 세부 리포트를 확인해 보세요. 👇`
      
      const http = new CustomHttp(Urls.MNWISE , {
        Authorization : Constants.MNWISE_KEY,
        Accept : 'application/json; charset=utf-8',
        'Content-Type' : 'application/json; charset=utf-8',
      })
      await http.post(Endpoint.KAKAO_ALERT , {
        SEQ : `${business.id}_${Date.now()}${mobile}`,
        RECEIVER : mobile, //user.mobile
        JONMUN: {
          SENDER_KEY : Constants.SENDER_KEY,
          TMPL_CD : String(process.env.CODE_DAILY_REPORT),
          SND_MSG : message,
          MESSAGE_TYPE : "AI",
          ATTACHMENT : [
            {
              name: "세부 리포트 바로 확인", 
              type : "WL", 
              url_mobile : "https://hyphenboostermobile.page.link/report", 
              url_pc : "https://mobile.booster.hyphen.im/report"
            }
          ]
        }
      })
    } catch(e) {
    }
  }

  private async monthlyReport(
    business : UserBusiness,
    mobile : string
  ) {
    const deliveryType = {
      [DeliveryType.baemin] : '배달의민족',
      [DeliveryType.yogiyo] : '요기요',
      [DeliveryType.coupang_eats] : '쿠팡이츠',
    };
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
      const thisMonth = `${firstDay.substring(0,4)}-${firstDay.substring(5,7)}`
      const expectedDelivery = await this.deliveryPvd.kakaoPurchaseSum(
        business , 
        before,
        ReportType.month
      );
      
      const expectedPurchase = await this.purchasePvd.kakaoPurchaseSum(
        business , 
        before,
        ReportType.month
      );
      let expectCardTotal : number = 0;
      let expectMsg : string = '';
      expectedPurchase.forEach(deposit => {
        if(deposit) {
          expectCardTotal += Number(deposit['realAmt']) ? Number(deposit['realAmt']) : 0
        }
      })
      expectMsg += `└카드 : ${moneyMasking(expectCardTotal)}원\n`;
      
      expectedDelivery.forEach(delivery => {
        if (delivery) {
          expectMsg += `└${deliveryType[delivery['type']]} : ${moneyMasking(delivery['settleAmt'])}원\n`
        }
      })

      const deliveryDeposit = await this.deliveryDepositPvd.kakaoDepositDelivery(
        business , 
        before,
        ReportType.month
      )
      const crefiaDeposit = await this.depositPvd.kakaoDepositDate(
        business , 
        before,
        ReportType.month
      )
      let depositTotal : number = 0;
      let cardDepositTotal : number = 0;
      crefiaDeposit.forEach(deposit => {
        if(deposit) {
          depositTotal += Number(deposit['salesAmt']) ? Number(deposit['salesAmt']) : 0;
          cardDepositTotal += Number(deposit['salesAmt']) ? Number(deposit['salesAmt']) : 0;
        }
      })
      
      deliveryDeposit.forEach(delivery => {
        if (delivery) {
          depositTotal += Number(delivery['settleAmt']) ? Number(delivery['settleAmt']) : 0;
        }
      })
      let depositDetail ='';
      depositDetail = `└카드 : ${cardDepositTotal ? moneyMasking(cardDepositTotal) : 0}원\n`
      deliveryDeposit.forEach(delivery => {
        if (delivery) {
          depositDetail += `└${deliveryType[delivery['type']]} : ${moneyMasking(delivery['settleAmt'])}원\n`
        }
      })

      const expectedNextMonthDelivery = await this.deliveryPvd.kakaoPurchaseSum(
        business , 
        thisMonth,
        ReportType.month
      );
      
      const expectedNextMonthPurchase = await this.purchasePvd.kakaoPurchaseSum(
        business , 
        thisMonth,
        ReportType.month
      );
      let nextPurchaseTotal : number = 0 ;
      let expectedNextCardTotal : number = 0;
      expectedNextMonthPurchase.forEach(async deposit => {
        if(deposit) {
          nextPurchaseTotal += Number(deposit['realAmt']) ? Number(deposit['realAmt']) : 0;
          expectedNextCardTotal += Number(deposit['realAmt']) ? Number(deposit['realAmt']) : 0;
        }
      })
      
      let nextExpectedMonthDetail = '';

      let paymentDate = await this.purchasePvd.findLastSettleDate(business);
      
      nextExpectedMonthDetail += `└카드 : ${moneyMasking(expectedNextCardTotal)}원`

      if(paymentDate) {
        const date = new Date(new Date(paymentDate.payment_date).setHours(new Date().getHours() + 9))
        const strDate = date.toISOString();
        nextExpectedMonthDetail += `${strDate.substring(0,4)}년 ${strDate.substring(5,7)}월 ${strDate.substring(8,10)}월 (${this.WEEKDAY[date.getDay()]})(예정)`
      }
      
      nextExpectedMonthDetail += '\n';
      expectedNextMonthDelivery.forEach(async delivery => {
        if (delivery) {
          nextPurchaseTotal += Number(delivery['settleAmt']) ? Number(delivery['settleAmt']) : 0
          let settleDate = await this.deliveryPvd.findLastSettleDate(business , delivery.type)
          nextExpectedMonthDetail += `└${deliveryType[delivery['type']]} : ${moneyMasking(Number(delivery['settleAmt']))}원`
          if(settleDate?.settle_date) {
            const date = new Date(new Date(settleDate.settle_date).setHours(new Date().getHours() + 9))
            const strDate = date.toISOString();
            nextExpectedMonthDetail += `${strDate.substring(0,4)}년 ${strDate.substring(5,7)}월 ${strDate.substring(8,10)}월 (${this.WEEKDAY[date.getDay()]})(예정)`
          }
          nextExpectedMonthDetail += '\n'
        }
      })
      let salesTotal : number = 0;
      const card = await this.crefiaSalesPvd.kakaoSum(
        business , 
        `${before}-01`,
        `${thisMonth}-01`,
        ReportType.month
      ) // 카드
      if (card) salesTotal += Number(card['total'])
      const cash = await this.cashSalesPvd.kakaoSum(
        business , 
        `${before}-01`,
        `${thisMonth}-01`,
        ReportType.month
      ) // 현금영수증
      if (cash) salesTotal += Number(cash['total'])
      const tax = await this.taxSalesPvd.kakaoSum(
        business , 
        `${before}-01`,
        `${thisMonth}-01`,
        ReportType.month
      ) // 세금계산서
      if (tax) salesTotal += Number(tax['total'])
      const delivery = await this.deliveryPvd.kakaoSum(
        business , 
        `${before}-01`,
        `${thisMonth}-01`,
        ReportType.month
      )// 배달
      if (delivery) salesTotal += Number(delivery['total'])
      let salesTotalDetail = '';
      if (card) {
        salesTotalDetail += `└카드 : ${moneyMasking(card['total'])}원\n`
      } else {
        salesTotalDetail += `└카드 : 0원\n`
      }
      if (cash) {
        salesTotalDetail += `└현금영수증 : ${moneyMasking(cash['total'])}원\n`
      } else {
        salesTotalDetail += `└현금영수증 : 0원\n`
      }
      if (tax) {
        salesTotalDetail += `└세금계산서 : ${moneyMasking(tax['total'])}원\n`
      } else {
        salesTotalDetail += `└세금계산서 : 0원\n`
      }
      if (delivery) {
        salesTotalDetail += `└배달(온라인 결제) : ${moneyMasking(delivery['total'])}원\n`
      } else {
        salesTotalDetail += `└배달(온라인 결제) : 0원\n`
      }
      // const msg = `지난달 벌어들인 돈 한 번에 정리! 📈\n\n☂️ 사업장명: ${business.store_name}\n☂️ 기간: ${before.substring(0,4)}년 ${before.substring(5,7)}월\n\n🎯 ${before.substring(5,7)}월 입금예정액\n${expectMsg}\n□ ${before.substring(5,7)}월 실입금완료 \n${moneyMasking(depositTotal)}원\n${depositDetail} \n\n□ 다음달(${thisMonth.substring(5,7)}월) 입금예정\n${moneyMasking(nextPurchaseTotal)}원\n${nextExpectedMonthDetail} \n\n🎯 ${before.substring(5,7)}월 총매출\n${moneyMasking(salesTotal)}원\n${salesTotalDetail} \n\n시간대 분석 등 세부 리포트를 확인해 보세요. 👇`
      // const msg = `지난달 벌어들인 돈 한 번에 정리! 📈\n\n☂️ 사업장명: ${business.store_name}\n☂️ 기간 ${before.substring(0,4)}년 ${before.substring(5,7)}월\n\n🎯 ${before.substring(5,7)}월 입금예정액 \n${expectMsg}\n\n□ ${before.substring(5,7)}월 입금완료\n: ${moneyMasking(depositTotal)}원\n${depositDetail}\n\n□ 다음달(${thisMonth.substring(5,7)}월) 입금예정\n: ${moneyMasking(nextPurchaseTotal)}원\n${nextExpectedMonthDetail}\n\n🎯 ${before.substring(5,7)}월 \n총 매출: ${moneyMasking(salesTotal)}원\n${salesTotalDetail}\n\n시간대 분석 등 세부 리포트를 확인해 보세요. 👇`
      const msg = `지난달 벌어들인 돈 한 번에 정리! 📈\n\n☂️ 사업장명: ${business.store_name}\n☂️ 기간 ${before.substring(0,4)}년 ${before.substring(5,7)}월\n\n🎯 ${before.substring(5,7)}월 입금예정액 \n${expectMsg}\n□ ${before.substring(5,7)}월 입금완료\n: ${moneyMasking(depositTotal)}원\n${depositDetail}\n\n□ 다음달(${thisMonth.substring(5,7)}월) 입금예정\n: ${moneyMasking(nextPurchaseTotal)}원\n${nextExpectedMonthDetail}\n\n🎯 ${before.substring(5,7)}월 \n총 매출: ${moneyMasking(salesTotal)}\n${salesTotalDetail}\n\n시간대 분석 등 세부 리포트를 확인해 보세요. 👇`;

      const http = new CustomHttp(Urls.MNWISE , {
        Authorization : Constants.MNWISE_KEY,
        Accept : 'application/json; charset=utf-8',
        'Content-Type' : 'application/json; charset=utf-8',
      })
      await http.post(Endpoint.KAKAO_ALERT , {
        SEQ : `${business.id}_${Date.now()}${mobile}`,
        RECEIVER : mobile, //user.mobile
        JONMUN: {
          SENDER_KEY : Constants.SENDER_KEY,
          TMPL_CD : String(process.env.CODE_MONTHLY_REPORT),
          SND_MSG : msg,
          MESSAGE_TYPE : "AI",
          ATTACHMENT :  [
            {
              name: "세부 리포트 바로 확인", 
              type : "WL", 
              url_mobile:"https://hyphenboostermobile.page.link/monthly_report", 
              url_pc : "https://mobile.booster.hyphen.im/monthly_report"
            }
          ]
        }
      })
    } catch (e) {
    }
  }
}