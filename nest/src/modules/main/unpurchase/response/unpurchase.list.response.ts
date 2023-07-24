import { ApiProperty } from "@nestjs/swagger";

export class UnpurchaseList {
  @ApiProperty({
    type : String,
    default : "53243806",
    description : `승인번호`
  })
  apprNo : string;

  @ApiProperty({
    type : String,
    default : "2022-10-04 00:01:34",
    description : `거래일시`
  })
  trDt : string;

  @ApiProperty({
    type : String,
    default : "5188-31*-*-*",
    description : `카드번호`
  })
  cardNo : string;

  @ApiProperty({
    type : String,
    default : "삼성카드",
    description : `카드사명`
  })
  cardCorp1 : string;

  @ApiProperty({
    type : Number,
    default : 5,
    description : `카드사 검색 코드`
  })
  cardCode : number;

  @ApiProperty({
    type : String,
    default : "",
    description : `제휴사명`
  })
  cardAliance : string;

  @ApiProperty({
    type : String,
    default : "55000",
    description : `승인금액`
  })
  apprAmt : string;

  @ApiProperty({
    type : String,
    default : "일시불",
    description : `할부개월`
  })
  instDiv : string;

  @ApiProperty({
    type : String,
    default : "11847397",
    description : `가맹점번호`
  })
  memNo : string;

  @ApiProperty({
    type : Number,
    default : 0,
    description : `할부개월`
  })
  inst : number;

}

export class UnpurchaseListResponse {
  @ApiProperty({
    type : [UnpurchaseList]
  })
  unpurchases : [UnpurchaseList]
}