import { ApiProperty } from "@nestjs/swagger";

export class PurchaseCard {
  @ApiProperty({
    type : String,
    description : '카드사',
    default : '농협NH카드',
  })
  cardCorp1 : string;

  @ApiProperty({
    type : String,
    description : '매입 금액',
    default : '2400000',
  })
  buySumAmt : string;

  @ApiProperty({
    type : String,
    description : '매입 수',
    default : '7',
  })
  buySumCnt : string;

  @ApiProperty({
    type : String,
    description : '수수료',
    default : '43185',
  })
  commSum : string;

  @ApiProperty({
    type : String,
    description : '실제 지급 예정 금액',
    default : '2356815',
  })
  paySumAmt : string;

}

export class PurchaseCardResponse {
  @ApiProperty({
    type : [PurchaseCard]
  })
  purchases : [PurchaseCard]
}