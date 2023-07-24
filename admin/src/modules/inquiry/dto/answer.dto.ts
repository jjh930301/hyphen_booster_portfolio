import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AnswerDto {

  @ApiProperty({
    type : String,
    description : 'uuid',
    required : true
  })
  @IsString()
  id : string;
  
  @ApiProperty({
    type : String,
    description : '내용',
    required : true
  })
  @IsString()
  desc : string;
}
