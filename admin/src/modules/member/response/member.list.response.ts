import { ApiProperty } from "@nestjs/swagger";

class MemberList {
  @ApiProperty({
    default : 6,
    type : Number,
    description : `id`
  })
  id : number;

  @ApiProperty({
    default : "MA-6",
    type : String,
    description : `유저번호`
  })
  user_num : string;

  @ApiProperty({
    default : "지정의",
    type : String,
    description : `이름`
  })
  name : string;

  @ApiProperty({
    default : "justin",
    type : String,
    description : `아이디`
  })
  user_id : string;

  @ApiProperty({
    default : "user@gmail.com",
    type : String,
    description : `이메일`
  })
  email : string;

  @ApiProperty({
    default : "",
    type : String,
    description : `전화번호`
  })
  mobile : string;

  @ApiProperty({
    default : 0,
    type : Number,
    description : `
      0 : 최고 관리자
      1 : 관리자
    `
  })
  type : number;

  @ApiProperty({
    default : 0,
    type : String,
    description : `
      0 : 사용
      1 : 중지
      2 : 해지
    `
  })
  status : string;

  @ApiProperty({
    default : "2022-11-21T05:19:48.000Z",
    type : String,
    description : `최근 로그인 UTC`
  })
  login_at : string;

  @ApiProperty({
    default : "2022-10-26T17:47:47.433Z",
    type : String,
    description : `생성일 UTC`
  })
  created_at : string;
}

export class MemberListResponse {
  @ApiProperty({
    type : Number,
    default : 10
  })
  count : number;
  @ApiProperty({
    type : [MemberList]
  })
  members : [MemberList]

}