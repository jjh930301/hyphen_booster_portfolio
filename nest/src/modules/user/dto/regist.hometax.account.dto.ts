import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class RegistHometaxAccountDto {
  @ApiProperty({
    type : String,
    description : 'id'
  })
  @IsNotEmpty()
  hometax_id : string;

  @ApiProperty({
    type : String,
    description : 'password'
  })
  @IsNotEmpty()
  hometax_password : string;

  @ApiProperty({
    type : String
  })
  @IsOptional()
  business_id : string;
}