import { ApiProperty } from "@nestjs/swagger";

class DeliveryDepositList {
  @ApiProperty({
    type : String,
    default :  "20220802",
    description : `
      정산일자
      배민 : calDate
      요기요 : calDate 
    `
  })
  settleDt : string;

  @ApiProperty({
    type : String,
    default :  "18220",
    description : `
      정산금액
      배민 : getAmt
      요기요 : getAmt
      쿠팡이츠 : settlementAmt
    `
  })
  settleAmt : string;

  @ApiProperty({
    type : String,
    default :  "22500",
    description : `
      배민 : orderAmt 
      요기요 : orderAmt
      쿠팡이츠 : 판매금액(salesAmt)
    `
  })
  orderAmt : string;

  @ApiProperty({
    type : String,
    default :  "배민1",
    description : `서비스명`
  })
  service : string;

  @ApiProperty({
    type : Number,
    default :  0,
    description : `
      0 : 배달의민족
      1 : 요기요
      2 : 쿠팡이츠
    `
  })
  type : number;

  @ApiProperty({
    type : Number,
    default :  0,
    description : `
      입금예정 : 0
      입금완료 : 1
      입금요청 : 2
      입금제외 : 3
    `
  })
  subStatus : number;

  @ApiProperty({
    type : Number,
    description : `
    배달의민족 : 0
    배민포장주문 : 4
    배민1 : 1
    요기요 : 2
    쿠팡이츠 : 3
    `
  })
  serviceType : number;

  @ApiProperty({
    type : String,
    description : `
      정산시작일
      배민 : orderSdate
      요기요 : orderSdate
      쿠팡이츠 : 쿠팡이츠에서는 값을 주지 않습니다.
    `
  })
  orderSdate :string;
  
  @ApiProperty({
    type : String,
    description : `
      정산종료일
      배민 : orderEdate
      요기요 : orderEdate
      쿠팡이츠 : 쿠팡이츠에서는 값을 주지 않습니다.
    `
  })
  orderEdate :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : smallOrderAmt
    `
  })
  smallOrderAmt :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : deliveryTip
    `
  })
  deliveryTip :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : discntAmt
      요기요 : discntAmt
    `
  })
  discntAmt :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : takeoutAmt
    `
  })
  takeoutAmt :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : employeeAmt
    `
  })
  employeeAmt :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : mediFee
      요기요 : mediFee
    `
  })
  mediFee :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : serviceFee
      요기요 : serviceFee
    `
  })
  serviceFee :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : deliveryAmt
      요기요 : deliveryFee
    `
  })
  deliveryAmt :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : deliveryDiscntAmt
      요기요 : deliveryDiscntAmt
    `
  })
  deliveryDiscntAmt :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : extFee
      요기요 : extFee
    `
  })
  extFee :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : offlineAmt
      요기요 : offlineAmt
    `
  })
  offlineAmt :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : adjAmt
      요기요 : cupFee
      쿠팡이츠 : balance
    `
  })
  adjAmt :string;
  
  @ApiProperty({
    type : String,
    description : `
      배민 : 기타 수수료 배민에서는 사용하지 않습니다.
      요기요 : terminalFee + addFee + monthlyFee + unpaidCharge
      쿠팡이츠 : deductedAmt
    `
  })
  etcFee :string;

  @ApiProperty({
    type : String,
    description : `
      배민 : refundAmt
      쿠팡이츠 : returnAmt
    `
  })
  refundAmt :string;

  @ApiProperty({
    type : String,
    description : `
      배민 : custDiscntAmt
    `
  })
  custDiscntAmt : string;

  @ApiProperty({
    type : String,
    default : "0",
    description : `
      배민 : storeDeliveryTip
    `
  })
  storeDeliveryTip: string;
  
  @ApiProperty({
    type : String,
    default : "0",
    description : `
      배민 : extraAdVat
    `
  })
  extraAdVat: string;

  @ApiProperty({
    type : String,
    default : "0",
    description : `
      배민 : extraAd
    `
  })
  extraAd: string;

  @ApiProperty({
    type : String,
    default : "0",
    description : `
      배민 : addTax
    `
  })
  addTax: string;

  @ApiProperty({
    type : String,
    default : "0",
    description : `
      배민 : addTax
    `
  })
  adFee: string;

  @ApiProperty({
    type : String,
    default : "0",
    description : `
      배민 : custDeliveryTip
    `
  })
  custDeliveryTip: string;
  
  @ApiProperty({
    type : String,
    default : "0",
    description : `
      배민 : discntSupAmt
    `
  })
  discntSupAmt: string;
}

export class DeliveryDepositListResponse {
  @ApiProperty({
    type : [DeliveryDepositList]
  })
  deliveries : [DeliveryDepositList];
}