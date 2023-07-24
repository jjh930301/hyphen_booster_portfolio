import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RegistHometaxDto {
  @ApiProperty({
    type : String,
    description : 'cert key'
  })
  @IsNotEmpty()
  hometax_cert : string;

  @ApiProperty({
    type : String,
    description : 'cert pri'
  })
  @IsNotEmpty()
  hometax_pri : string;

  @ApiProperty({
    type : String,
    description : '홈택스 인증서 비밀번호'
  })
  @IsNotEmpty()
  hometax_cert_password : string;
}