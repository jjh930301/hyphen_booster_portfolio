import { ApiProperty } from "@nestjs/swagger";

export class NotificationsResponse {

  @ApiProperty({
    type : String,
    description : `제목`
  })
  title: string;

  @ApiProperty({
    type : String,
    description : `내용`
  })
  body: string;

  @ApiProperty({
    type : Date,
    description : `생성일`
  })
  created_at: Date;

  @ApiProperty({
    type : Date,
    description : `업데이트일`
  })
  updated_at: Date;

}