import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CheckPasswordDto {

  @ApiProperty({
    type : String,
    description : 'device_id'
  })
  @IsString()
  device_id : string;

  @ApiProperty({
    type : String,
    description : 'password'
  })
  @IsString()
  password : string;
}