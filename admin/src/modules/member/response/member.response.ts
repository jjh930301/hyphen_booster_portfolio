import { ApiProperty } from "@nestjs/swagger"

class Member {
  @ApiProperty({
    default : 6,
    description : `pk`,
    type : Number
  })
  id : number;

  @ApiProperty({
    default : "MA-6",
    description : `회원번호`,
    type : String
  })
  user_num : string;

  @ApiProperty({
    default : "지정의",
    description : `이름`,
    type : String
  })
  name : string;

  @ApiProperty({
    default : "justin",
    description : `아이디`,
    type : String
  })
  user_id : string;

  @ApiProperty({
    default : "user@gmail.com",
    description : `이메일`,
    type : String
  })
  email : string;

  @ApiProperty({
    default : "010-1234-5678",
    description : `전화번호`,
    type : String
  })
  mobile : string;

  @ApiProperty({
    default : 0,
    description : `
      0 : 최고 관리자
      1 : 관리자
    `,
    type : Number
  })
  type : number;

  @ApiProperty({
    default : 0,
    description : `
      0 : 사용
      1 : 중지
      2 : 해지
    `,
    type : String
  })
  status : string;

  @ApiProperty({
    default : "2022-11-21T05:36:02.000Z",
    description : `마지막 로그인`,
    type : String
  })
  login_at : string;

  @ApiProperty({
    default : null,
    description : `중지일`,
    type : String
  })
  stoped_at : string;

  @ApiProperty({
    default : null,
    description : `해지일`,
    type : String
  })
  terminated_at : string;

  @ApiProperty({
    default : "2022-10-26T17:47:47.433Z",
    description : `생성일`,
    type : String
  })
  created_at : string;

}

export class MemberResponse {
  @ApiProperty({
    type : Member
  })
  member : Member
}