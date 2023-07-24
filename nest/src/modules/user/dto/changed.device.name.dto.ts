import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ChangedDeviceNameDto {
  @ApiProperty({
    type : String,
    description : 'device uuid',
  })
  @IsString()
  device_id : string;

  @ApiProperty({
    type : String,
    description : '변경할 device name',
  })
  @IsString()
  device_name : string;
}