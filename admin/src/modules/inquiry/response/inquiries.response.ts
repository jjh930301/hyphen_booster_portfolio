import { ApiProperty } from "@nestjs/swagger";

class User {
  @ApiProperty({
    default : "MU-038g7R",
    type : String,
    description : ``,
  })
  user_num : string;

  @ApiProperty({
    default : "지정의",
    type : String,
    description : ``,
  })
  name : string;

  @ApiProperty({
    default : "01012345678",
    type : String,
    description : ``,
  })
  mobile : string;

  @ApiProperty({
    default : 0,
    type : Number,
    description : '사업자 갯수'
  })
  business_count : number

}
export class InquiriesModel {
  @ApiProperty({
    default : "3d1c5f82-c08f-46ce-9f23-709215de677b",
    type : String,
    description : `uuid`
  })
  id : string;

  @ApiProperty({
    default : 2,
    type : String,
    description : `
      0 : 사업자등록번호 추가 
      1 : 의견 보내기 
      2 : 서비스 오류 문의 
      3 : 이벤트 문의 
      4 : 기타
    `,
  })
  type : string;

  @ApiProperty({
    default : "1111",
    type : String,
    description : `제목`
  })
  title : string;

  @ApiProperty({
    default : [
      "https://kr.object.ncloudstorage.com/booster-dev-bucket/7a22ec29-fe2a-483d-91b1-1ce17db7dbfb/inquiry/1667892095621",
      "https://kr.object.ncloudstorage.com/booster-dev-bucket/7a22ec29-fe2a-483d-91b1-1ce17db7dbfb/inquiry/1668751239639"
    ],
    type : [String],
    description : '이미지 목록'
  })
  images : [string];

  @ApiProperty({
    default : "1111",
    type : String,
    description : `내용`
  })
  description : string;

  @ApiProperty({
    default : null,
    type : String,
    description : `답변 관리자`
  })
  answer_admin : string;
  
  @ApiProperty({
    default : null,
    type : String,
    description : `답변 관리자`
  })
  answer_description : string;

  @ApiProperty({
    default : null,
    type : String,
    description : `답변 관리자`
  })
  answer_title : string;

  @ApiProperty({
    default : 0,
    type : Number,
    description : `
      문의 상태
      0 : 미답변
      1 : 확인중
      2 : 답변
    `
  })
  status : number;

  @ApiProperty({
    default : "2022-11-08T16:21:36.522Z",
    type : String,
    description : `작성일`
  })
  created_at : string;

  @ApiProperty({
    default : "2022-11-08T16:21:36.522Z",
    type : String,
    description : `답변일`
  })
  answered_at : string;

  @ApiProperty({
    type : User
  })
  user : User

}

export class InquiriesResponse {
  @ApiProperty({
    type : Number,
    default : 10
  })
  count : number;
  @ApiProperty({
    type : [InquiriesModel]
  })
  inquiries : [InquiriesModel]
}