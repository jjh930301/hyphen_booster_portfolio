import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ChangedPasswordDto {
  @ApiProperty({
    type : String,
    description : 'regacy password'
  })
  @IsString()
  regacy_password : string;

  @ApiProperty({
    type : String,
    description : 'new password'
  })
  @IsString()
  new_password : string;
}