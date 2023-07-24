import { ApiProperty } from "@nestjs/swagger";

class YLDeliveryList {
  @ApiProperty({
    default :  "2023-04-30 23:33:54",
    description : `주문일자`,
    type : String
  })
  ORDERDATE:string;
  @ApiProperty({
    default :  "145;000",
    description : `주문금액`,
    type : String
  })
  ORDERPRICE:string;
  @ApiProperty({
    default :  "승인",
    description : `현장결제 금액`,
    type : String
  })
  ONSITEPAYMENT:string;
  @ApiProperty({
    default :  "완료",
    description : `주문상태`,
    type : String
  })
  ORDERSTATUS:string;
  @ApiProperty({
    default :  "배달의민족",
    description : `배달앱`,
    type : String
  })
  DELIVERY_NM:string;
  @ApiProperty({
    default :  "B1GD01Z5K5",
    description : `주문번호`,
    type : String
  })
  ORDERNUMBER:string;
}

class YLDeliveryApprAmt {
  @ApiProperty({
    type : String,
    default : '115,500'
  })
  ORDERPRICE : string;

  @ApiProperty({
    type : String,
    default : '10,500'
  })
  ONSITEPAYMENT : string;
}

class YLDeliveryData {
  @ApiProperty({
    type : Boolean,
    default : false
  })
  success: boolean;
  @ApiProperty({
    type : String,
    default : '조회된 데이터가 없습니다.'
  })
  message: string;
  @ApiProperty({
    type : [YLDeliveryApprAmt],
    description : 'nullable하게 들어갑니다'
  })
  data1: [YLDeliveryApprAmt];
  @ApiProperty({
    type : [YLDeliveryList],
    description : 'nullable하게 들어갑니다'
  })
  data2: [YLDeliveryList];
}

export class YLDeliveryResponse {
  @ApiProperty({
    type : YLDeliveryData
  })
  data : YLDeliveryData
}