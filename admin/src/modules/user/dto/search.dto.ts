import { ApiProperty } from "@nestjs/swagger";

export class SearchDto {
  @ApiProperty({
    type : String,
    required : false
  })
  word : string;

  @ApiProperty({
    type : Number,
    description : `
      1 : 회원번호
      2 : 이름
      3 : 휴대폰 번호
      4 : 사업자 번호
    `,
    required : false,
  })
  search : number
}