import { CardApprBatch } from "src/entities/interpos/cardappr.batch.entity";
import { CashBatch } from "src/entities/interpos/cash.batch.entity";
import { KstaCardCompany } from "src/enums/card.code";

export class FcmType {
  /**
   * 절대 변경 불가
   */
  static EVENT = "0"; // 이벤트
  static NOTIFICATION = "1"; // 공지사항
  static KAKAO = "2"; // 카카오알림
  static INQUIRY = "3"; //문의 답변
  static CARD_APPROVAL = "11"; // 카드 승인
  static CARD_CANCEL_APPROVAL = "12"; // 카드 취소
  static CASH_APPROVAL = "13"; // 현금 승인
  static CASH_CANCEL_APPROVAL = "14"; // 현금 취소
  static UNPURCHASE  = "15"; // 미매입
  static UNDEPOSIT = "16"; // 매입완료
  static DAILY_REPORT = "21"; // 일일 리포트 (알림톡) / 맞춤
  static MONTHLY_REPORT = "22"; // 월간 리포트 (알림톡) / 맞춤
  static CREFIA = "101"; // 여신 스크래핑 완료
  static HOMETAX = "102"; // 홈택스 스크래핑 완료
  static BAEMIN = "103"; // 배민 스크래핑 완료
  static YOGIYO = "104"; // 요기요 스크래핑 완료
  static COUPANGE = "105"; // 쿠팡이츠 스크래핑 완료
  static EXPIRED_CERT = "107" // 공동인증서 만료
  static HOMETAX_CONNECT_CERT = "108" // 공동인증서 홈택스 연결 성공
  static HOMETAX_DISCONNECT_CERT = "109" // 공동인증서 홈택스 연결 성공

  static MESSAGE_TYPE : Object = {
    [FcmType.KAKAO] : {
      title : '',
      body : ''
    },
    [FcmType.CARD_APPROVAL] : (
      data : CardApprBatch
    ) : Object => {
      return {
        title : "카드 승인" ,
        body : `카드번호 ${data.card_no} | ${data.appr_date} ${data.appr_time}`,
      }
    },
    [FcmType.CARD_CANCEL_APPROVAL] : (
      data : CardApprBatch
    ) : Object  => {
      return {
        title : '카드 취소',
        body : `카드번호 ${data.card_no} | ${data.cancel_date} ${data.cancel_time}`,
      }
    },
    [FcmType.CASH_APPROVAL] : (
      data : CashBatch
    ) : Object => {
      return {
        title : '현금 승인',
        body : `${data.total_amount} 원 | ${data.appr_date} ${data.appr_time}`
      }
    },
    [FcmType.CASH_CANCEL_APPROVAL] : (
      data : CashBatch
    ) : Object => {
      return {
        title : '현금 승인취소',
        body : `${data.total_amount} 원 | ${data.appr_date} ${data.appr_time}`
      }
    },
    [FcmType.UNPURCHASE] : {
      title : '',
      body : ''
    },
    [FcmType.UNDEPOSIT] : {
      title : '',
      body : ''
    },
    [FcmType.DAILY_REPORT] : (
      date : string,
      type : number, // 0 : fcm | 1 : 증가 알림 | 2 : 감소 알림 | 3 : == 알림
      sales : number | null = null, // 판매금액
      per : number | null = null
    ) : Object => {
      // fcm message
      if(type === 0 ) {
        return {
          title : `${date} 일일리포트 도착`,
          body : '하루를 힘차게 시작하기 전 일일리포트를 확인해보세요.'
        }
      }
      //증가 알림
      if(type === 1) {
        return {
          title : `일일 리포트`,
          body : `${date} 매출은 ${sales}원 입니다
전날보다 매출이 ${per.toFixed(1)}% 증가했어요.`
        }
      }
      //감소 알림 , === 알림
      if(type === 2 || type === 3) {
        return {
          title : `일일 리포트`,
          body : `${date} 매출은 ${sales}원 입니다.`
        }
      }
      
    },
    [FcmType.MONTHLY_REPORT] : (
      date : string,
      type : number,
      sales : number | null = null,
      per : number | null = null,
    ) => {
      // fcm message
      if(type === 0 ) {
        return {
          title : `${date} 월간리포트 도착`,
          body : '저번 달 우리가게 살직 한 눈에 확인해보세요.'
        }
      }
      //증가 알림
      if(type === 1) {
        return {
          title : `월간 리포트`,
          body : `${date} 매출은 ${sales}원 입니다
전날보다 매출이 ${per.toFixed(1)}% 증가했어요.`
        }
      }
      //감소 알림 , === 알림
      if(type === 2 || type === 3) {
        return {
          title : `월간 리포트`,
          body : `${date} 매출은 ${sales}원 입니다.`
        }
      }
    },
    [FcmType.EVENT] : {
      title : "",
      body : ""
    },
    [FcmType.NOTIFICATION] : {
      title : "",
      body : ""
    },
    [FcmType.CREFIA] : {
      title : `여신금융협회 데이터 불러오기 완료!`,
      body : `사장님의 카드 매출 정보를 모두 불러왔어요. (최대 2년)

✔ 카드 매출 내역 조회 

✔ 카드 매출 누락 확인 

✔ 기간별, 시간대별, 요일별 등 다양한 통계 `
    },
    [FcmType.HOMETAX] : {
      title : "홈택스 데이터 불러오기 완료!",
      body : `사장님의 홈택스 매출 정보를 모두 불러왔어요. (최대 2년) 

✔ 현금영수증 매출 조회 

✔ 세금계산서 매출 조회 

✔ 기간별, 시간대별, 요일별 등 다양한 통계 `
    },
    [FcmType.BAEMIN] : {
      title : "배달의민족 데이터 불러오기 완료!",
      body : `사장님의 배달의민족 매출 정보를 모두 불러왔어요. (최대 2년) 

✔ 배달앱 매출/정산 조회 

✔ 기간별, 시간대별, 배달 분석 등 다양한 통계 `
    },
    [FcmType.YOGIYO] : {
      title : "요기요 데이터 불러오기 완료!",
      body : `사장님의 요기요 매출 정보를 모두 불러왔어요. (최대 6개월) 
      
✔ 배달앱 매출/정산 조회 

✔ 기간별, 시간대별, 배달 분석 등 다양한 통계 `
    },
    [FcmType.COUPANGE] : {
      title : "쿠팡이츠 데이터 불러오기 완료!",
      body : `사장님의 쿠팡이츠 매출 정보를 모두 불러왔어요. (최대 2년) 
      
✔ 배달앱 매출/정산 조회 

✔ 기간별, 시간대별, 배달 분석 등 다양한 통계 `
    },
    [FcmType.EXPIRED_CERT] : {
      title : '공동인증서 만료 안내',
      body : `등록된 공동인증서가 만료되었어요.
최신 공동인증서로 다시 등록해주세요.`
    },
    [FcmType.HOMETAX_CONNECT_CERT] : {
      title : "공동인증서 홈택스 연결 성공",
      body : `등록된 공동인증서로 홈택스 연결이 완료되었어요.
세금게산서, 현금영수증 정보를 조회해보세요.`
    },
    [FcmType.HOMETAX_DISCONNECT_CERT] : {
      title : `공동인증서 홈택스 연결 실패`,
      body : `등록된 공동인증서로 시도한 홈택스 자동 연결이 실패했어요.
홈택스를 따로 연결하여 매출을 확인하세요.`
    }
  }
}