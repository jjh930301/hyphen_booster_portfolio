import { ApiProperty } from "@nestjs/swagger";

export class RegistCrefiaDto {
  @ApiProperty({
    type : String,
    example : 'jinhgoon',
    description : '여신금웅 계정 ID'
  })
  crefia_id : string;

  @ApiProperty({
    type : String,
    example : 'jh610208++',
    description : '여신금융 계정 비밀번호'
  })
  crefia_password : string;
}