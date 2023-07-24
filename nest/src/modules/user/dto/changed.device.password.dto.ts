import { ApiProperty } from "@nestjs/swagger";

export class ChangedDevicePasswordDto {
  @ApiProperty({
    type : String,
    description : 'device_id'
  })
  device_id : string;

  @ApiProperty({
    type : String,
    description : 'password'
  })
  password : string;
}