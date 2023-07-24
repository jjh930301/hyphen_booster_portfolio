import { ApiProperty } from "@nestjs/swagger";

class CashSalesList {
  @ApiProperty({
    type : String,
    description : '거래 일 / 시간',
    default : '2022-08-09T22:24:16.000Z'
  })
  trDt : string;

  @ApiProperty({
    type : String,
    description : '발행구분',
    default : '사업자'
  })
  issueGb : string;

  @ApiProperty({
    type : String,
    description : '공급가액',
    default : '50000'
  })
  supAmt : string;

  @ApiProperty({
    type : String,
    description : '수수료',
    default : '5000'
  })
  taxAmt : string;

  @ApiProperty({
    type : String,
    description : '봉사료',
    default : '0'
  })
  tip : string;

  @ApiProperty({
    type : String,
    description : '전체 금액',
    default : '55000'
  })
  totAmt : string;

  @ApiProperty({
    type : String,
    description : '승인번호',
    default : '093018785'
  })
  apprNo : string;

  @ApiProperty({
    type : String,
    description : '발급수단ㄷ',
    default : '1047'
  })
  frPartNo : string;

  @ApiProperty({
    type : String,
    description : '거래구분',
    default : '승인거래'
  })
  trGb : string;

  @ApiProperty({
    type : String,
    description : '비고',
    default : '일반거래'
  })
  cshptTrsTypeNm : string;

  @ApiProperty({
    type : String,
    description : `원거래 승인일시`,
    default : '2022-10-08T00:00:00.000Z'
  })
  originTrDt : string;

}

export class CashSalesListResponse {
  @ApiProperty({
    type : String,
    default : '309092',
    description : '합계'
  })
  total : string;

  @ApiProperty({
    type : [CashSalesList]
  })
  sales : [CashSalesList]
}