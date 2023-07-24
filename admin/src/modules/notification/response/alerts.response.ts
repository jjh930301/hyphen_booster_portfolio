import { ApiProperty } from "@nestjs/swagger";

export class AlertsModel {
  @ApiProperty({
    default : "f83dd9aa-598f-4753-b1f0-5349889e1f31",
    type : String,
    description : 'uuid'
  })
  id : string;

  @ApiProperty({
    default : "asdasfvadf",
    type : String,
    description : '제목'
  })
  title : string;

  @ApiProperty({
    default : "asdfasdfasdfasdfasdfasdfasdfasdfasdf",
    type : String,
    description : '본문'
  })
  body : string;

  @ApiProperty({
    default : null,
    type : String,
    description : '이벤트'
  })
  event : string;

  @ApiProperty({
    default : 1,
    type : String,
    description : '공지사항은 항상 1'
  })
  event_type : string;

  @ApiProperty({
    default : true,
    type : Boolean,
    description : '공지사항은 항상 true'
  })
  is_public : boolean;

  @ApiProperty({
    default : true,
    type : Boolean,
    description : 'true 게시 , false 미게시'
  })
  is_open : boolean;

  @ApiProperty({
    default : true,
    type : String,
    description : '읽음 처리는 개인 알림만 사용'
  })
  is_read : string;

  @ApiProperty({
    default : null,
    type : String,
    description : '푸시가 간 시간'
  })
  pushed_at : string;

  @ApiProperty({
    default : 'justin',
    type : String,
    description : '관리자 id'
  })
  admin_id : string;

  @ApiProperty({
    default : "2022-11-23T16:18:29.055Z",
    type : String,
    description : '생성시간'
  })
  created_at : string;

  @ApiProperty({
    default : "2022-11-23T16:31:18.545Z",
    type : String,
    description : '업데이트 시간'
  })
  updated_at : string;

  @ApiProperty({
    default : null,
    type : String,
    description : '삭제 시간'
  })
  deleted_at : string;

}

export class AlertsResponse {
  @ApiProperty({
    type : Number,
    default : 10
  })
  count : number;
  @ApiProperty({
    type : [AlertsModel]
  })
  alerts : [AlertsModel]
}