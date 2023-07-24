import { ApiProperty } from "@nestjs/swagger";

class Cards {
  @ApiProperty({
    type : String,
    description : `
      카드사
    `,
    default : 'KB카드'
  })
  cardCorp1 : string;

  @ApiProperty({
    type : String,
    description : `
      총 거래 금액
    `,
    default : '8811500'
  })
  trSumAmt : string;

  @ApiProperty({
    type : String,
    description : `
      총 횟수
    `,
    default : '30'
  })
  trSumCnt : string;

  @ApiProperty({
    type : String,
    description : `
      승인 거래 합계
    `,
    default :'8811500'
  })
  apprSumAmt : string;

  @ApiProperty({
    type : String,
    description : `
      승잉 횟수
    `,
    default : '30'
  })
  apprSumCnt : string;

  @ApiProperty({
    type : String,
    description : `
      취소 합계
    `,
    default : '0'
  })
  canSumAmt : string;

  @ApiProperty({
    type : String,
    description : `
      취소 횟수
    `,
    default : '0'
  })
  canSumCnt : string;

  @ApiProperty({
    type : String,
    description : `
      수수료 합게
    `,
    default : '111017'
  })
  comm : string;

}
export class CardsResponse {
  @ApiProperty({
    type : [Cards],
  })
  cards : [Cards]
}