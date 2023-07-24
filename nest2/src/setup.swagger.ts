import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const setupSwagger = (app : INestApplication) : void => {
  const options = new DocumentBuilder()
  .setTitle("hyphen-booster nest2 doc")
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
    EXPIRED_CERT = "107" // 공동인증서 만료
    HOMETAX_CONNECT_CERT = "108" // 공동인증서 홈택스 연결 성공
    HOMETAX_DISCONNECT_CERT = "109" // 공동인증서 홈택스 연결 실패
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