import { ApiProperty } from "@nestjs/swagger";

export class NotiListDto {
  @ApiProperty({
    type : Number,
    description : 'id',
    required : false
  })
  id : number;

  @ApiProperty({
    type : Number,
    description : 'page',
    required : false
  })
  page : number;

  @ApiProperty({
    type : Number,
    description : 'count',
    required : false
  })
  count : number;
}