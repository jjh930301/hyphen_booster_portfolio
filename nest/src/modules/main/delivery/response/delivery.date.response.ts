import { ApiProperty } from "@nestjs/swagger";

export class DeliveryDate {
  @ApiProperty({
    type : String,
    description : '주문일시 ',
    default :  "20220801",
  })
  orderDt: string;

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
    description : '주문금액',
    default :  "3806200",
  })
  orderAmt: string;

  @ApiProperty({
    type : String,
    description : '취소금액',
    default :  "482150",
  })
  canAmt: string;

  @ApiProperty({
    type : String,
    description : '수수료',
    default :  "-161574",
  })
  feeAmt: string;

  @ApiProperty({
    type : String,
    description : '판매횟수',
    default :  "255",
  })
  apprSumCnt: string;

  @ApiProperty({
    type : String,
    description : '취소횟수',
    default :  "27",
  })
  canSumCnt: string;

  @ApiProperty({
    type : String,
    description : '전체횟수',
    default :  "27",
  })
  totCnt : string;

}

export class DeliveryDateResponse {
  @ApiProperty({
    type : [DeliveryDate]
  })
  deliveries : [DeliveryDate];
}