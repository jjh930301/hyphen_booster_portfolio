import { ApiProperty } from "@nestjs/swagger";

export class Deliveries {
  @ApiProperty({
    type : Number,
    default : 0,
    description : `
      0 배민
      1 요기요
      2 쿠팡이츠
    `
  })
  type: number;

  @ApiProperty({
    type : String,
    default : "2022-08-31T19:07:17.000Z",
    description : `주문일시`
  })
  orderDt: string;

  @ApiProperty({
    type : String,
    default : "B1BB01BW5X",
    description : `주분번호`
  })
  orderNo: string;

  @ApiProperty({
    type : String,
    default : "성공",
    description : `주문결과`
  })
  orderDiv: string;

  @ApiProperty({
    type : String,
    default : "14000",
    description : `주문 금액`
  })
  orderAmt: string;

  @ApiProperty({
    type : String,
    default : "14000",
    description : `결제 금액`
  })
  payAmt: string;

  @ApiProperty({
    type : String,
    default : "14000",
    description : `
      배민 : salesAmt
      쿠팡이츠 : totalAmt
    `
  })
  salesAmt: string;

  @ApiProperty({
    type : String,
    default : "울트라콜",
    description : `광고상품 그룹`
  })
  adCampaign: string;

  @ApiProperty({
    type : String,
    default : "바로결제",
    description : `결제 타입`
  })
  payMet: string;

  @ApiProperty({
    type : String,
    default : "배달",
    description : `수령방법`
  })
  deliveryType: string;

  @ApiProperty({
    type : String,
    default : "(ICE) 메가리카노",
    description : `주문 내역`
  })
  orderName: string;

  @ApiProperty({
    type : String,
    default : "2500",
    description : `배달료`
  })
  deliveryAmt: string;

  @ApiProperty({
    type : String,
    default : "2022-09-05T00:00:00.000Z",
    description : `정산일자`
  })
  settleDt: string;

  @ApiProperty({
    type : String,
    default : "16228",
    description : `정산금액`
  })
  settleAmt: string;

  @ApiProperty({
    type : String,
    default : '0',
    description : `주문수수료 [주문중개]`
  })
  orderFee : string;

  @ApiProperty({
    type : String,
    default : '0',
    description : `라이더 수수료 [주문중개]`
  })
  riderFee : string;

  @ApiProperty({
    type : String,
    default : '0',
    description : `배달 수수료 [배달]`
  })
  deliverFee : string;

  @ApiProperty({
    type : String,
    default : '0',
    description : `카드수수료 [그외]`
  })
  cardFee : string;

  @ApiProperty({
    type : String,
    default : '0',
    description : `배달 수수료 할인 [배달]`
  })
  deliverFeeDiscount : string;

  @ApiProperty({
    type : String,
    default : "-25",
    description : `
      배민 : tax
      쿠팡이츠 : addTax
    `
  })
  tax: string;
  
  @ApiProperty({
    type : String,
    default : "-25",
    description : `고객배달팁 [배달]`
  })
  custDeliveryTip: string;

  @ApiProperty({
    type : String,
    default : "-25",
    description : `일회용컵보증금액 [그외]`
  })
  cupFee: string;

  @ApiProperty({
    type : String,
    default : "-25",
    description : `가게배달팁 [배달]`
  })
  storeDeliveryTip: string;

  @ApiProperty({
    type : String,
    default : "-247",
    description : `차감금액`
  })
  deductedAmt: string;

  @ApiProperty({
    type : String,
    default : "0",
    description : `
    배민 : 고객할인금액 [주문중개]
    요기요 : 본사할인금액 headDiscntAmt
    `
  })
  custDiscntAmt: string;

  @ApiProperty({
    type : String,
    default : "0",
    description : `소액주문 할인 [주문중개]`
  })
  smallOrderAmt : string;

}

export class DeliveriesResponse {
  @ApiProperty({
    type : String,
    default : '4223850',
    description : '기간 | 검색 결과 전체 주문금액'
  })
  total : string;

  @ApiProperty({
    type : String,
    default : '4223850',
    description : '기간 | 검색 결과 전체 주문금액'
  })
  onlineTotal : string;

  @ApiProperty({
    type : String,
    default : '4223850',
    description : '기간 | 검색 결과 전체 주문금액'
  })
  offlineTotal : string;

  @ApiProperty({
    type : String,
    default : '255',
    description : '성공'
  })
  success : string;

  @ApiProperty({
    type : String,
    default : '27',
    description : '취소'
  })
  failure : string;

  @ApiProperty({
    type : String,
    default : '27',
    description : '전체획수'
  })
  allCnt : string;

  @ApiProperty({
    type : [Deliveries]
  })
  deliveries : [Deliveries];
}