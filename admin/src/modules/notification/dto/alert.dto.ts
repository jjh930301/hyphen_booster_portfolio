import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AlertDto {
  @ApiProperty({
    type : String,
    description : 'title'
  })
  @IsString()
  @IsNotEmpty()
  title : string;

  @ApiProperty({
    type : String,
    description : 'body'
  })
  @IsString()
  @IsNotEmpty()
  body : string;

  @ApiProperty({
    type : Boolean,
    description : `
      true : 게시
      false : 미게시
    `
  })
  @IsNotEmpty()
  is_open : boolean;

  @ApiProperty({
    type : Number,
    default : 2,
    description : `
      1 : fcm 발송
      2 : fcm 미발송
    `,
    required : false
  })
  push : number;
  
}