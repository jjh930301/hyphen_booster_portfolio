import { ApiProperty } from "@nestjs/swagger";

class DepositCard {
  @ApiProperty({
    type : String,
    default : "KB카드",
    description : '카드사명'
  })
  cardCorp1 : string;

  @ApiProperty({
    type : String,
    default : "6665000",
    description : '판매금액'
  })
  salesAmt : string;

  @ApiProperty({
    type : String,
    default : "160",
    description : '판매수'
  })
  salesCnt : string;

  @ApiProperty({
    type : String,
    default : "6592213",
    description : '실제 입금액'
  })
  realAmt : string;

}

export class DepositCardResponse {
  @ApiProperty({
    type : [DepositCard]
  })
  deposits : [DepositCard]
}