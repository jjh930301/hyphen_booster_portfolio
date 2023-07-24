export class Endpoint {
  static CHECK_BUSINESS_HYPHEN = 'in0076000263'; // 휴폐업조회
  static NEW_CHECK_BUSINESS_HYPHEN = 'oa0139000873'; // 개업일자 , 대표자명 , 사업자번호 https://hyphen.im/product-api/view?seq=119

  static CREFIA_USER_INFO = 'in0048000119'; // 가맹점 정보조회 https://hyphen.im/product-api/view?seq=12
  static CREFIA_FEE_RATE = 'in0048000120'; // 가맹점 수수료율/대금지급주기 조회
  static CREFIA_APPROVAL_CARD = 'in0048000122' // 기간별 승인내역 
  static CREFIA_PURCHASE_CARD = 'in0048000124' // 기간별 매입내역
  static CREFIA_DEPOSIT_CARD = 'in0048000126' // 기간별 입금내역

  static HOMETAX_USER_INFO = 'in0076000244' // 회원정보 조회 https://hyphen.im/product-api/view?seq=70
  static HOMETAX_SALES_CASH = 'in0076000274' // 현금영수증(매출) https://hyphen.im/product-api/view?seq=58
  static HOMETAX_PURCHASE_CASH = 'in0076000275' // 현금영수증(매입)
  static HOMETAX_SALES_TAX = 'in0076000266' // 세금계산서발행내역(매출)
  static HOMETAX_PURCHASE_TAX = 'in0076000267' // 세금계산서발행내역(매입)

  static BAEMIN_SHOP_INFO = 'in0022000067' // 배달의민족 음식점정보조회 https://hyphen.im/product-api/view?seq=16
  static BAEMIN_SALES = 'in0022000063' // 배달의민족 매출조회
  static BAEMIN_DEPOSIT = 'in0022000064'; // 배달의민족 정산내역

  static YOGIYO_SHOP_INFO = 'in0023000078'; // 요기요 음심점정보조회 https://hyphen.im/product-api/view?seq=16
  static YOGIYO_SALES = 'in0023000073' // 요기요 매출조회
  static YOGIYO_DEPOSIT = 'in0023000074'; // 요기요 정산내역
  
  static COUPANG_EATS_SHOP_INFO = 'in0024000082'; // 쿠팡이츠 음심점정보조회 https://hyphen.im/product-api/view?seq=16
  static COUPANG_EATS_SALES = 'in0024000080' // 쿠팡이츠 매출조회
  static COUPANG_EATS_DEPOSIT = 'in0024000081'; // 쿠팡이츠 정산내역

  static PRIVATE_BANK_ACCOUNT_INFO = 'in0087000520' // 개인은행 전 계좌 조회 https://hyphen.im/product-api/view?seq=89
  static PRIVATE_BANK_HISTORY = 'in0087000485' // 개인은행 거래내역 조회
  static KYUNGNAM_BANK_ACCOUNT_INFO = 'in0028000858' // 경남은행 전 계좌 조회 https://hyphen.im/product-api/view?seq=109
  static KYUNGNAM_BANK_HISTORY = 'in0028000859' // 경남은행 거래내역 조회

  /**
   * KSNET_TOKEN 회원정보 확인할 때만 필요합니다.
   * CARD | CASH insert시에는 영빈님이 내부적으로 넣어줍니다...
   */
  static POS_TOKEN = 'ksta/getKsToken/hyphen'; // 토큰 발급
  static POS_REFRESH_TOKEN = 'ksta/refreshKsToken/hyphen'; // 토큰 갱신
  static POS_CARD = 'ksta/loadCard/year'; // 카드 매출 불러오기
  static POS_CASH = 'ksta/loadCash/year'; // 현금 매출 불러오기

  /**
   * -4 일 경우 토큰 만료 재귀함수 호출
   */
  // ksnet
  static KSNET_USER_CHECK = 'svcrf/S0KSTCOJ03I201';
  
  /**
   * 엠앤와이즈 end point
   */
   static KAKAO_ALERT='v1.0/at/send'
   static MNWISE_MAIL='v1.0/mail/send'
}