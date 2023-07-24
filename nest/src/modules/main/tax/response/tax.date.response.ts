import { ApiProperty } from "@nestjs/swagger";

export class TaxDate {
  @ApiProperty({
    type : String,
    default : '20220614',
    description : '공급일'
  })
  makeDt : string;

  @ApiProperty({
    type : String,
    default : '8470000',
    description : '전체 금액'
  })
  totAmt : string;

  @ApiProperty({
    type : String,
    default : '7700000',
    description : '공급가액'
  })
  supAmt : string;

  @ApiProperty({
    type : String,
    default : '770000',
    description : '세금'
  })
  taxAmt : string;

  @ApiProperty({
    type : String,
    default :'',
    description : '카운트'
  })
  count : string;
}

export class TaxDateResponse {
  @ApiProperty({
    type : TaxDate
  })
  bills : [TaxDate]
}