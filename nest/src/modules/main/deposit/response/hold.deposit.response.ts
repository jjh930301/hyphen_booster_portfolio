import {ApiProperty} from '@nestjs/swagger';

class HoldDeposit {
  @ApiProperty({
    type : String,
    default :"2022-03-15",
    description : `입금일자`
  })
  payDt: string;

  @ApiProperty({
    type : String,
    default :"롯데카드",
    description : `카드사`
  })
  cardCorp1: string;

  @ApiProperty({
    type : String,
    default :"1",
    description : `매출건수`
  })
  salesCnt: string;

  @ApiProperty({
    type : String,
    default :"9878087006",
    description : `가맹점 번호`
  })
  memNo: string;

  @ApiProperty({
    type : String,
    default :"외환은행",
    description : `결제 은행`
  })
  bank: string;

  @ApiProperty({
    type : String,
    default :"21718******",
    description : `결제 계좌`
  })
  acctNo: string;

  @ApiProperty({
    type : String,
    default :"29625",
    description : `보류금액`
  })
  detAmt: string;

  @ApiProperty({
    type : String,
    default :"0",
    description : `기타입금`
  })
  etcAmt: string;

  @ApiProperty({
    type : String,
    default : "0",
    description : `실제 입금액`
  })
  realPayAmt: string;  

}

export class HoldDepositResponse {
  @ApiProperty({
    type : [HoldDeposit]
  }) 
  deposits : [HoldDeposit]
}