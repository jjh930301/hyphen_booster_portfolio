import { ApiProperty } from "@nestjs/swagger";

class PurchaseList {
  @ApiProperty({
    type : String,
    description : '지급 예정일',
    default : '20220901'
  })
  payDt: string;

  @ApiProperty({
    type : String,
    description : '결제일',
    default : '20220830'
  })
  trDt: string;

  @ApiProperty({
    type : String,
    description : '매입일',
    default : '20220831'
  })
  buyDt: string;

  @ApiProperty({
    type : String,
    description : '승인번호',
    default : '74261426'
  })
  apprNo: string;

  @ApiProperty({
    type : String,
    description : '가맹점 번호',
    default : '117060580'
  })
  memNo : string;

  @ApiProperty({
    type : String,
    description : '카드사',
    default : '비씨카드'
  })
  cardCorp1: string;

  @ApiProperty({
    type : String,
    description : '카드 번호',
    default : '6210-03*-*-*'
  })
  cardNum: string;

  @ApiProperty({
    type : String,
    description : '카드 구분',
    default : '체크'
  })
  cardiv: string;

  @ApiProperty({
    type : String,
    description : '지급 예정액',
    default : '19750'
  })
  payAmt: string;

  @ApiProperty({
    type : String,
    description : '매입 금액',
    default : '20000'
  })
  buyAmt: string;

  @ApiProperty({
    type : String,
    description : '수수료',
    default : '250'
  })
  comm: string;

}

export class PurchaseListResponse {
  @ApiProperty({
    type : String,
    default : '23962267',
    description : '합계'
  })
  total : string;
  @ApiProperty({
    type : String,
    default : '575',
    description : '합계'
  })
  sumCnt : string;

  @ApiProperty({
    type : [PurchaseList]
  })
  purchases : [PurchaseList]
}