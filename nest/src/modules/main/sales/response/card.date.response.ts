import { ApiProperty } from "@nestjs/swagger";

export class CardDate {
  @ApiProperty({
    type : String,
    description : `
      거래일
    `,
    default : '20220801'
  })
  trDt : string;

  @ApiProperty({
    type : String,
    description : `
      거래금액합계
    `,
    default : '2860000'
  })
  trSumAmt : string;

  @ApiProperty({
    type : String,
    description : `
     총 횟수
    `,
    default : '5'
  })
  trSumCnt : string;

  @ApiProperty({
    type : String,
    description : `
      승인금액합계
    `,
    default : '2860000'
  })
  apprSumAmt : string;

  @ApiProperty({
    type : String,
    description : `
      승인횟수
    `,
    default : '5'
  })
  apprSumCnt : string;

  @ApiProperty({
    type : String,
    description : `
      승인취소금액합계
    `,
    default : "0"
  })
  canSumAmt : string;

  @ApiProperty({
    type : String,
    description : `
      승인취소횟수
    `,
    default : '0'
  })
  canSumCnt : string;

  @ApiProperty({
    type : String,
    description : `
      수수료 합게
    `,
    default : '36750'
  })
  comm : string;

}

export class CardDateResponse {
  @ApiProperty({
    type : [CardDate],

  })  
  cards : [CardDate]
}