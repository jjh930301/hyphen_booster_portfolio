import { ApiProperty } from "@nestjs/swagger";

export class InquirySearchDto {
  @ApiProperty({
    type : Number,
    description : `
      0 : 사업자등록번호 추가 
      1 : 의견 보내기 
      2 : 서비스 오류 문의 
      3 : 이벤트 문의 
      4 : 기타
    `,
    required : false,
  })
  type : number;

  @ApiProperty({
    type : Number,
    description : `
      0 : 미답변
      1 : 확인중
      2 : 답변
    `,
    required : false,
  })
  status : number;

  @ApiProperty({
    type : Number,
    required : false,
    description : `
      1 : 제목
      2 : 회원 이름
    `
  })
  search_type : number;

  @ApiProperty({
    type : String,
    required : false,
    description : '검색어'
  })
  word : string;
}