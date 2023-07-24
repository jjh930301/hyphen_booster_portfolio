import { ApiProperty } from "@nestjs/swagger";

class YLDeliveryDeposit {
  @ApiProperty({
    type : String,
    default :  "2023-03-02",
    description : `정산일자`
  })
  TP_DATE:string;
  @ApiProperty({
    type : String,
    default :  "2,599,304",
    description : `당일입금금액`
  })
  FINOVRFEE:string;
  @ApiProperty({
    type : String,
    default :  "103",
    description : `카드매출건수`
  })
  APPRCNT:string;
  @ApiProperty({
    type : String,
    default :  "2,558,000",
    description : `카드매출금액`
  })
  APPRAMT:string;
  @ApiProperty({
    type : String,
    default :  "80,500",
    description : `카드취소금액`
  })
  APPRAMT_CANCEL:string;
  @ApiProperty({
    type : String,
    default :  "8",
    description : `배달앱매출건수`
  })
  ORDERCNT:string;
  @ApiProperty({
    type : String,
    default :  "231,500",
    description : `배달앱매출금액`
  })
  ORDERAMT:string;
  @ApiProperty({
    type : String,
    default :  "109,969",
    description : `원데이서비스 정산 수수료`
  })
  ACCOUNT_FEE2:string;
}

class YLCardDepositList {
  @ApiProperty({
    default :  "2023-02-28 07:53:52",
    type : String,
    description : `거래일자`
  })
  TRADEDATE:string;
  @ApiProperty({
    default :  "42,651",
    type : String,
    description : `입금액`
  })
  FINOVRFEE:string;
  @ApiProperty({
    default :  "44,000",
    type : String,
    description : `승인금액`
  })
  APPRAMT:string;
  @ApiProperty({
    default :  "1,348",
    type : String,
    description : `서비스수수료`
  })
  ACCOUNT_FEE2:string;
  @ApiProperty({
    default :  "70621351",
    type : String,
    description : `승인번호`
  })
  APPRNO:string;
  @ApiProperty({
    default :  "비씨카드",
    type : String,
    description : `매입사`
  })
  BUYING_NM:string;
}

class YLCardDeposit {
  
  @ApiProperty({
    default :  "3,805,989",
    description : `당일입금금액 합계`,
    type : String
  })
  FINOVRFEE:string;
  @ApiProperty({
    default :  "12",
    description : `카드매출건수 합계`,
    type : String
  })
  APPRCNT:string;
  @ApiProperty({
    default :  "3,918,000",
    description : `카드매출금액 합계`,
    type : String
  })
  APPRAMT:string;
  @ApiProperty({
    default :  "0",
    description : `카드취소금액 합계`,
    type : String
  })
  APPRAMT_CANCEL:string;
  @ApiProperty({
    default :  "10",
    description : `배달앱매출건수 합계`,
    type : String
  })
  ORDERCNT:string;
  @ApiProperty({
    default :  "신용",
    description : `배달앱매출금액 합계`,
    type : String
  })
  ORDERAMT:string;
  @ApiProperty({
    default :  "112,011",
    description : `원데이서비스 정산수수료 합계`,
    type : String
  })
  ACCOUNT_FEE2:string;

}

class YLDeliveryDepositList {
  @ApiProperty({
    type : String,
    default :  "2023-03-01 19:30:59",
    description : `주문일자`
  })
  ORDERDATE:string;
  @ApiProperty({
    type : String,
    default :  "22,013",
    description : `입금액`
  })
  FINOVRFEE:string;
  @ApiProperty({
    type : String,
    default :  "23,000",
    description : `주문금액`
  })
  ORDERAMT:string;
  @ApiProperty({
    type : String,
    default :  "987",
    description : `서비스수수료`
  })
  ACCOUNT_FEE2:string;
  @ApiProperty({
    type : String,
    default :  "B1GD01Z5K5",
    description : `주문번호`
  })
  ORDERNO:string;
  @ApiProperty({
    type : String,
    default :  "배달의 민족",
    description : `배달앱명`
  })
  DELIVERY_NM:string;
}

class YLDepositData {
  @ApiProperty({
    type : Boolean,
    default : false
  })
  success: boolean;
  @ApiProperty({
    type : String,
    default : '조회된 데이터가 없습니다.'
  })
  message: string;
  @ApiProperty({
    type : [YLCardDeposit],
    description : 'nullable하게 들어갑니다'
  })
  data1: [YLCardDeposit];
  @ApiProperty({
    type : [YLDeliveryDeposit],
    description : 'nullable하게 들어갑니다'
  })
  data2: [YLDeliveryDeposit];

  @ApiProperty({
    type :[YLCardDepositList],
    description : 'nullable하게 들어갑니다'
  })
  data3 : [YLCardDepositList]

  @ApiProperty({
    type :[YLDeliveryDepositList],
    description : 'nullable하게 들어갑니다'
  })
  data4 : [YLDeliveryDepositList]
}

export class YLDepositResponse {
  @ApiProperty({
    type : YLDepositData
  })
  data : YLDepositData
}