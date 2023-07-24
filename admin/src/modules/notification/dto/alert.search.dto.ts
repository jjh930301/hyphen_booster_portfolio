import { ApiProperty } from "@nestjs/swagger";

export class AlertSearchDto {
  @ApiProperty({
    type : Number,
    default : 0,
    required : false,
    description :`
    1 : 게시 
    0 : 미게시`
  })
  is_open : number;

  @ApiProperty({
    type : Number,
    default : 2,
    description : `
      1 : 발송
      2 : 미발송
    `,
    required : false
  })
  push : number

  @ApiProperty({
    type : Number,
    default : 1,
    description : '1 : title , 2 : admin_id',
    required : false
  })
  type : number;

  @ApiProperty({
    type : String,
    default : 'word',
    required : false
  })
  word : string;
}