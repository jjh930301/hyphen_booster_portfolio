import { ApiProperty } from "@nestjs/swagger";

export class MemberSearchDto {
  @ApiProperty({
    type : Number,
    default : 0,
    required : false,
    description : `
      상태
      0 : 사용
      1 : 중지
      2 : 해지
    `
  })
  status : number;

  @ApiProperty({
    type : Number,
    default : 0,
    required : false,
    description : `
      권한
      0 : 최고 관리자
      1 : 관리자
    `
  })
  authority : number;

  @ApiProperty({
    type : Number,
    required : false,
    description : `
      1 : 아이디
      2 : 이름
      3 : 휴대폰번호
      4 : 이메일
    `
  })
  type : number;

  @ApiProperty({
    type : String,
    default : 'MA-6',
    required : false,
    description : '유저번호'
  })
  word : string;
}