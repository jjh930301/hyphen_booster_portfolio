import { ApiProperty } from "@nestjs/swagger";

class Total {
  @ApiProperty({
    default : "4381750",
    type : String
  })
  total: string;
  @ApiProperty({
    default : "3570950",
    type : String
  })
  onlineTotal: string;
  @ApiProperty({
    default : "810800",
    type : String
  })
  offlineTotal: string;
  @ApiProperty({
    default : "247",
    type : String
  })
  success: string;
  @ApiProperty({
    default : "26",
    type : String
  })
  failure: string;
  @ApiProperty({
    default : "273",
    type : String
  })
  allCnt: string;
}

class DeliveryPurchase {
  @ApiProperty({
    type : String,
    default : '20220801'
  })
  settleDt: string;

  @ApiProperty({
    type : Number,
    description : `
      0 : 배민
      1 : 요기요
      2 : 쿠팡이츠
    `,
    default :  0,
  })
  type: number;

  @ApiProperty({
    type : String,
    default : '63100'
  })
  settleAmt: string;

  @ApiProperty({
    type : String,
    default : '63100'
  })
  orderAmt: string;

  @ApiProperty({
    type : String,
    default : '63100'
  })
  payAmt: string;

  @ApiProperty({
    type : String,
    default : '3'
  })
  sumCnt : string;
}

export class DeliveryPurchaseReseponse {
  @ApiProperty({
    type : Total
  })
  total : Total
  @ApiProperty({
    type : [DeliveryPurchase]
  })
  deliveries : [DeliveryPurchase]
}