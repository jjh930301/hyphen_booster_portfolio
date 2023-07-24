import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const setupSwagger = (app : INestApplication) : void => {
  const options = new DocumentBuilder()
  .setTitle("hyphen-booster doc")
  .setDescription(`
    hyphen-booster Documentation
    fcm type | 알림
    EVENT = "0"; // 이벤트
    NOTIFICATION = "1"; // 공지사항
    KAKAO = "2"; // 카카오알림
    INQUIRY = "3"; // 문의 답변 | event = inquiry_id
    CARD_APPROVAL = "11"; // 카드 승인 | event = json
    CARD_CANCEL_APPROVAL = "12"; // 카드 취소 | event = json
    CASH_APPROVAL = "13"; // 현금 승인 | event = json
    CASH_CANCEL_APPROVAL = "14"; // 현금 취소 | event = json
    UNPURCHASE  = "15"; // 미매입 event busienss_id | fcm,알림 = 카드 매출 누락 확인 *
    UNDEPOSIT = "16"; // 미입금 event business_id | fcm,알림 = 미입금 *
    DAILY_REPORT = "21"; // 일일 리포트 
    MONTHLY_REPORT = "22"; // 월간 리포트
    CREFIA = "101"; // 여신 스크래핑 완료 event business_id | fcm = 메인화면 | 알림 = 카드매출
    HOMETAX = "102"; // 홈택스 스크래핑 완료 event business_id | fcm = 메인화면 | 알림 = 현금매출
    BAEMIN = "103"; // 배민 스크래핑 완료 event business_id | fcm = 메인화면 | 알림 = 배달매출
    YOGIYO = "104"; // 요기요 스크래핑 완료 event business_id | fcm = 메인화면 | 알림 = 배달매출
    COUPANGE = "105"; // 쿠팡이츠 스크래핑 완료 event business_id | fcm = 메인화면 | 알림 = 배달매출

    카드 실시간
    biz_no 사업자번호
    record 데이터 타입 R = 실시간
    appr_yn 승인여부 Y | N
    card_no 카드번호
    validity 카드 유효기간
    installment 할부기간
    appr_amount 승인금액
    service_charge 봉사료
    appr_no 승인번호
    appr_date 승인일자
    appr_time 승인시간
    cancel_date 취소일자
    cancel_time 취소시간
    member_no 카드사 가맹점 번호
    bscis_code 카드 발급사 코드
    bscpr_code 카드 매입사 코드 (주로 이걸로 사용합니다)
    filler 추가 데이터
    termid 단말기ID
    comm_rate 현금IC 수수료율
    memb_comm_rate 현금IC 가맹점 수수료

    현금 실시간
    biz_no 사업자 번호
    record 데이터구분
    termid 단말기ID
    req_date 요청일
    appr_yn 승인구분 Y | N
    krw_division 원화 구분
    transaction_type 거래자구분
    biz_key 가맹점key값
    identification 신분확인
    sales_amount 판매금액
    tax_amount 세금
    service_charge 봉사료
    total_amount 전체금액
    appr_date 승인일자
    appr_time 승인시간
    origin_appr_date 원승인일자
    appr_no 승인번호
    reject_cod 거절코드
    filler 추가 데이터
  `)
  .addBearerAuth({
    name : 'authentication',
    type : 'http',
    in : 'Header'
  } , 'Required user accessToken')
  .addBearerAuth({
    name : "authorization",
    type : "http",
    in: "Header"
  } , "Required admin accessToken")
  .setVersion("1.0.0")
  .build()

  const document = SwaggerModule.createDocument(app , options);
  SwaggerModule.setup('docs' , app , document);
}