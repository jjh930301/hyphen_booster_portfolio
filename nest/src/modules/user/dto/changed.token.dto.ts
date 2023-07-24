import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ChangedTokenDto {
  @ApiProperty({
    type : String,
    description : 'device uuid',
  })
  @IsString()
  device_id : string;

  @ApiProperty({
    type : String,
    description : 'token',
  })
  @IsString()
  token : string;
}