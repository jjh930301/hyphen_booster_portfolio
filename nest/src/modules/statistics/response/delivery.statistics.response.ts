import { ApiProperty } from "@nestjs/swagger";

class OnlineOffline {
  @ApiProperty({
    type : Number,
    default : 1
  })
  onOff : number;

  @ApiProperty({
    type : String,
    default : '24935650',
    description : '주문금액'
  })
  orderAmt : string;

  @ApiProperty({
    type : String,
    default : '3515150',
    description : '@@결제금액'
  })
  payAmt : string;
}

class DeliveryType {
  @ApiProperty({
    type : Number,
    default : 0
  })
  type : number;

  @ApiProperty({
    type : String,
    default : '3515150',
    description : '주문금액'
  })
  orderAmt : string;

  @ApiProperty({
    type : String,
    default : '3515150',
    description : '@@결제금액'
  })
  payAmt : string;
}

class DeliveryStatistics {
  @ApiProperty({
    type : [OnlineOffline],
    description : `
      1 : 온라인결제
      2 : 오프라인결제
    `
  })
  online_offline : [OnlineOffline]

  @ApiProperty({
    type : [DeliveryType],
    description : `
      type
      0 : 배민
      1 : 요기요
      2 : 쿠팡이츠
    `
  })
  delivery_type : [DeliveryType]
}

export class DeliveryStatisticsResponse {
  @ApiProperty({
    type : DeliveryStatistics
  })
  delivery : DeliveryStatistics
}