import { ApiProperty } from "@nestjs/swagger";

class CardList {
  @ApiProperty({
    type : String,
    description : `
      거래일
    `,
    default : '2022-08-31T20:37:25.000Z'
  })
  trDt : string;

  @ApiProperty({
    type : String,
    description : `
      카드사
    `,
    default : '비씨카드'
  })
  cardCorp1 : string;

  @ApiProperty({
    type : Number,
    description : `
      1 : 승인 / 2 취소
    `,
    default : 1
  })
  trDiv : number;

  @ApiProperty({
    type : String,
    description : `
      가맹점번호
    `,
    default : '729566890'
  })
  memNo : string;

  @ApiProperty({
    type : String,
    description : `
      카드번호
    `,
    default : '4906-03*-*-*'
  })
  cardNo : string;

  @ApiProperty({
    type : String,
    description : `
      승인번호
    `,
    default : '78226332'
  })
  apprNo : string;

  @ApiProperty({
    type : String,
    description : `
      거래금액
    `,
    default : '500000'
  })
  apprAmt : string;

  @ApiProperty({
    type : String,
    description : `
      수수료
    `,
    default : '7500'
  })
  comm : string;

  @ApiProperty({
    type : String,
    description : `원거래 승인일시`,
    default : '2022-12-07T18:54:54.000Z'
  })
  originTrDt : string;

}
export class CardListResponse {
  @ApiProperty({
    type : String,
    default : '23962267',
    description : '합계'
  })
  total : string;

  @ApiProperty({
    type : [CardList],
  })
  cards : [CardList]
}