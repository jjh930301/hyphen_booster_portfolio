import { ApiProperty } from "@nestjs/swagger";

class DepositList {
  @ApiProperty({
    type : String,
    description : `입금일`,
    default : "20220831"
  })
  payDt : string;

  @ApiProperty({
    type : String,
    description : `실제입금액`,
    default : "54450"
  })
  realAmt : string;

  @ApiProperty({
    type : String,
    description : `실제 판매금액`,
    default : "60000"
  })
  salesAmt : string;

  // @ApiProperty({
  //   type : String,
  //   description : `가맹점번호`,
  //   default : "0009568122"
  // })
  // memNo : string;

  @ApiProperty({
    type : String,
    description : `카드사`,
    default : "신한카드"
  })
  cardCorp1 : string;

  @ApiProperty({
    type : String,
    description : `입금은행`,
    default : "외환은행"
  })
  bank : string;

  @ApiProperty({
    type : String,
    description : `계좌번호`,
    default : "21718******"
  })
  accountNo : string;

  @ApiProperty({
    type : Number,
    description : `판매수`,
    default : 1
  })
  salesCnt : number;
}

export class DepositListResponse {
  @ApiProperty({
    type : String,
    default : '28248545',
    description : '실제입금액 합계'
  })
  total : string;

  @ApiProperty({
    type : [DepositList]
  })
  deposits : [DepositList]
}