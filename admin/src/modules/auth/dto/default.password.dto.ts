import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class DefaultPasswordDto {
  @ApiProperty({
    type : String,
    description : 'user_id'
  })
  @IsString()
  user_id : string;
}