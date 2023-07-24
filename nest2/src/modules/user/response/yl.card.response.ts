import { ApiProperty } from "@nestjs/swagger";

class YLCardList {
  @ApiProperty({
    default :  "2023-04-30 23:33:54",
    description : `거래일자`,
    type : String
  })
  TRADEDATE:string;
  @ApiProperty({
    default :  "145,000",
    description : `거래금액`,
    type : String
  })
  APPRAMT:string;
  @ApiProperty({
    default :  "승인",
    description : `승인구분`,
    type : String
  })
  SUCCESSRES_NM:string;
  @ApiProperty({
    default :  "제이티넷",
    description : `van`,
    type : String
  })
  VAN_NM:string;
  @ApiProperty({
    default :  "44585548",
    description : `승인번호`,
    type : String
  })
  APPRNO:string;
  @ApiProperty({
    default :  "하나카드",
    description : `매입사`,
    type : String
  })
  BUYING_NM:string;
  @ApiProperty({
    default :  "신용",
    description : `카드구분`,
    type : String
  })
  CREDIT_NM:string;
}

class YLCardApprAmt {
  @ApiProperty({
    type : String,
    default : '49,126,620'
  })
  APPRAMT : string;
}

class YLCardData {
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
    type : [YLCardApprAmt],
    description : 'nullable하게 들어갑니다'
  })
  data1: [YLCardApprAmt];
  @ApiProperty({
    type : [YLCardList],
    description : 'nullable하게 들어갑니다'
  })
  data2: [YLCardList];
}

export class YLCardResponse {
  @ApiProperty({
    type : YLCardData
  })
  data : YLCardData
}