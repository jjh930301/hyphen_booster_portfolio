import { ApiProperty } from "@nestjs/swagger";

export class ChangedMemberInfoDto {
  @ApiProperty({
    type : String,
    required : false,
    description : '아이디'
  })
  user_id : string;

  @ApiProperty({
    type : String,
    required : false,
    description : '이름'
  })
  name : string;

  @ApiProperty({
    type : String,
    required : false,
    description : '휴대폰번호'
  })
  mobile : string;

  @ApiProperty({
    type : String,
    required : false,
    description : 'email'
  })
  email : string;

  @ApiProperty({
    type : Number,
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
    required : false,
    description : `
      권한
      0 : 최고 관리자
      1 : 관리자
    `
  })
  authority : number;
}