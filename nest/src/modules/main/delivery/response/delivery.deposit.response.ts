import { ApiProperty } from "@nestjs/swagger"

class DeliveryDeposit {
  @ApiProperty({
    type : String,
    default : "20220801",
    description : '정산일'
  })
  settleDt :string;

  @ApiProperty({
    type : Number,
    default : 0,
    description : `
      0 : 배달의민족
      1 : 요기요
      2 : 쿠팡이츠
    `
  })
  type :number;

  @ApiProperty({
    type : String,
    default : "3799313",
    description : '정산금액'
  })
  settleAmt :string;

  @ApiProperty({
    type : String,
    default : '3'
  })
  sumCnt : string;
  
}

export class DeliveryDepositResponse {
  @ApiProperty({
    type : [DeliveryDeposit]
  })
  deliveries : [DeliveryDeposit]
}