import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class NotiRegisterationDto {
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
    type : Number,
    description : `
      text : 0
      url : 1
      img : 2
    `
  })
  @IsNumber()
  @IsNotEmpty()
  type : number;
}