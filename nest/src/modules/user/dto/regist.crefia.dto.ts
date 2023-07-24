import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class RegistCrefiaDto {
  @ApiProperty({
    type : String,
    example : 'jinhgoon',
    description : '여신금웅 계정 ID'
  })
  @IsNotEmpty()
  crefia_id : string;

  @ApiProperty({
    type : String,
    example : 'jh610208++',
    description : '여신금융 계정 비밀번호'
  })
  @IsNotEmpty()
  crefia_password : string;

  @ApiProperty({
    type : String,
  })
  @IsOptional()
  business_id : string;
}