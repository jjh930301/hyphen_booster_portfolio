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

  static MESSAGE_TYPE : Object = {
    [FcmType.INQUIRY] : {
      title : '문의 답변 완료',
      body : `문의하신 내용에 답변이 달렸어요.
답변을 확인해 주세요.`
    },
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
    [FcmType.DAILY_REPORT] : {
      title : '',
      body : ''
    },
    [FcmType.MONTHLY_REPORT] : {
      title : '',
      body : ''
    },
    [FcmType.EVENT] : {
      title : "",
      body : ""
    },
    [FcmType.NOTIFICATION] : (body) : Object => {
      return {
        title : "새로운 공지",
        body : body
      }
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
      body : `사장님의 요기요 매출 정보를 모두 불러왔어요. (최대 2년) 
      
✔ 배달앱 매출/정산 조회 

✔ 기간별, 시간대별, 배달 분석 등 다양한 통계 `
    },
    [FcmType.COUPANGE] : {
      title : "쿠팡이츠 데이터 불러오기 완료!",
      body : `사장님의 쿠팡이츠 매출 정보를 모두 불러왔어요. (최대 2년) 
      
✔ 배달앱 매출/정산 조회 

✔ 기간별, 시간대별, 배달 분석 등 다양한 통계 `
    }
  }
}