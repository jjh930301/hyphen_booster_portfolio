import { ApiProperty } from "@nestjs/swagger"

export class InquiryResponse {
  @ApiProperty({
    default : "3d1c5f82-c08f-46ce-9f23-709215de677b",
    type : String,
    description : 'uuid'
  })
  id: string;

  @ApiProperty({
    default : 2,
    type : Number,
    description : 'type'
  })
  type: number;

  @ApiProperty({
    default : "11111aa",
    type : String,
    description : 'title'
  })
  title: string;

  @ApiProperty({
    default : "1111111aa2",
    type : String,
    description : 'description'
  })
  description: string;

  @ApiProperty({
    default : ["https://kr.object.ncloudstorage.com/booster-dev-bucket/7a22ec29-fe2a-483d-91b1-1ce17db7dbfb/inquiry/1667892095621"],
    type : [String],
    description : '이미지 목록'
  })
  images: [string];

  @ApiProperty({
    default : "",
    type : String,
    description : '답변 제목'
  })
  answer_title: string;

  @ApiProperty({
    default : null,
    type : String,
    description : '답변 내용'
  })
  answer_description: string;

  @ApiProperty({
    default : null,
    type : String,
    description : '답변 관리자'
  })
  answer_admin: string;

  @ApiProperty({
    default : null,
    type : String,
    description : '답변일시'
  })
  answered_at: string;

  @ApiProperty({
    default : 0,
    type : String,
    description : '상태'
  })
  status: string;

  @ApiProperty({
    default : "2022-11-08T16:21:36.522Z",
    type : String,
    description : '생성일'
  })
  created_at: string;

  @ApiProperty({
    default : "2023-01-09T16:51:21.000Z",
    type : String,
    description : '수정일'
  })
  updated_at: string;

  @ApiProperty({
    default : null,
    type : String,
    description : '삭제일'
  })
  deleted_at: string;

}