import { ApiProperty } from "@nestjs/swagger";

export class ReportsResponse {
  @ApiProperty({
    default : "11b49bb0-aea3-4f9d-be5d-dc60b3ed0b92",
    type : String,
    description : `리포트 UUID`
  })
  id : string;

  @ApiProperty({
    default : 1,
    type : Number,
    description : `1 : 일일 | 2 : 월간 | 3 : 연간`
  })
  type : number;

  @ApiProperty({
    default : "285800",
    type : String,
    description : `판매금액`
  })
  sales : string;

  @ApiProperty({
    default : "2233709",
    type : String,
    description : `예상입금액`
  })
  expected_deposit : string;

  @ApiProperty({
    default : "0",
    type : String,
    description : `지출 아직 사용하지 않음`,
    deprecated : true
  })
  expenditure : string;

  @ApiProperty({
    default : "0",
    type : String,
    description : `입금 아직 사용하지 않음`,
    deprecated : true
  })
  deposit : string;

  @ApiProperty({
    default : "-75.47",
    type : String,
    description : `등락률`
  })
  percent : string;

  @ApiProperty({
    default : "2022-11-07",
    type : String,
    description : `날짜`
  })
  date : string;

  @ApiProperty({
    default : "2022-11-08T12:36:49.050Z",
    type : String,
    description : `생성일`
  })
  created_at : string;

}