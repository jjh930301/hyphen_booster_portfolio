import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RefreshTokenDto{
  @ApiProperty({
    type : String,
    description : 'refresh token'
  })
  @IsString()
  refresh_token : string;
}