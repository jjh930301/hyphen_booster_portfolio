import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class ConnectBankDto {

  @ApiProperty({
    type : String,
    description : `은행 uuid`,
    required : true
  })
  @IsNotEmpty()
  bank_uuid : string;

  @ApiProperty({
    type : String,
    description : `
      인증서 번호
      인증서로 연결할 때는 cert_num 아닐 경우 id / pw
    `,
    required : false
  })
  @IsOptional()
  cert_num : string;

  @ApiProperty({
    type : String,
    description : `은행 계정`,
    required : false
  })
  @IsOptional()
  bank_id : string;

  @ApiProperty({
    type : String,
    description : `은행 계정 비밀번호`,
    required : false
  })
  @IsOptional()
  bank_password : string;

  @ApiProperty({
    type : String,
    description : '은행 비밀번호',
    required : false
  })
  @IsOptional()
  account_password
}