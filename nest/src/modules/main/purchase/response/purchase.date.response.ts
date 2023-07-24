import { ApiProperty } from "@nestjs/swagger";

export class PurchaseDate {

  @ApiProperty({
    type : String,
    description : '입금 예정일',
    default : '20220801'
  })
  payDt : string;

  @ApiProperty({
    type : String,
    description : '결제일',
    default : '20220727'
  })
  trDt : string;

  @ApiProperty({
    type : String,
    description : '매입일',
    default : '20220728'
  })
  buyDt : string;

  @ApiProperty({
    type : String,
    description : '매입금액',
    default : '910000'
  })
  buySumAmt : string;

  @ApiProperty({
    type : String,
    description : '매입 수',
    default : '2'
  })
  buySumCnt : string;

  @ApiProperty({
    type : String,
    description : '수수료합계',
    default : '20930'
  })
  commSum : string;

  @ApiProperty({
    type : String,
    description : '실제 매입 예정 금액',
    default : '889070'
  })
  paySumAmt : string;
}

export class PurchaseDateResponse {
  @ApiProperty({
    type : [PurchaseDate]
  })
  purchases : [PurchaseDate]
}