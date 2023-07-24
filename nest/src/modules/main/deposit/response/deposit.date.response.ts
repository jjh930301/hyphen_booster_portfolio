import { ApiProperty } from "@nestjs/swagger";

export class DepositDate {
  @ApiProperty({
    type : String,
    description : '입금일',
    default : '20220801'
  })
  payDt: string;

  @ApiProperty({
    type : String,
    description : '판매금액',
    default : '2400000'
  })
  salesAmt: string;
  
  @ApiProperty({
    type : String,
    description : '판매 수',
    default : '7'
  })
  salesCnt: string;
  
  @ApiProperty({
    type : String,
    description : '실제 입금액',
    default : '2356815'
  })
  realAmt: string;

}

export class DepositDateResponse {
  @ApiProperty({
    type : [DepositDate]
  })
  deposits : [DepositDate]
}