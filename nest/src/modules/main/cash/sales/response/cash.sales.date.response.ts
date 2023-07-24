import { ApiProperty } from "@nestjs/swagger";

export class CashSalesDate {
  @ApiProperty({
    type : String,
    description : '거래일',
    default: '20220809'
  })
  trDt : string;

  @ApiProperty({
    type : String,
    description : '공금가액',
    default: '100000'
  })
  supAmt : string;

  @ApiProperty({
    type : String,
    description : '거래횟수',
    default: '2'
  })
  supCnt : string;

  @ApiProperty({
    type : String,
    description : '수수료',
    default: '10000'
  })
  taxAmt : string;

  @ApiProperty({
    type : String,
    description : '수수료 수',
    default: '2'
  })
  taxCnt : string;

  @ApiProperty({
    type : String,
    description : '봉사료',
    default: '2'
  })
  tipAmt : string;

  @ApiProperty({
    type : String,
    description : '총 금액',
    default: '11000'
  })
  totAmt : string;

}

export class CashSalesDateResponse {
  @ApiProperty({
    type : [CashSalesDate]
  })
  sales : [CashSalesDate]
}