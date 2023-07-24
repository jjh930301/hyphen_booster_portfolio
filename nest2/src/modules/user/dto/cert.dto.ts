import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CertDto {
  @ApiProperty({
    type : String,
    description : 'cert key'
  })
  @IsNotEmpty()
  cert : string;

  @ApiProperty({
    type : String,
    description : 'cert pri'
  })
  @IsNotEmpty()
  pri : string;

  @ApiProperty({
    type : String,
    description : '홈택스 인증서 비밀번호'
  })
  @IsNotEmpty()
  cert_password : string;

  @ApiProperty({
    type : String,
    description : '인증서 번호'
  })
  cert_number : string;

  @ApiProperty({
    type : String,
    description : '인증서 발급자'
  })
  cert_issuer : string;

  @ApiProperty({
    type : Date,
    description : '인증서 만료일',
    example : '2023-02-28'
  })
  cert_expiration : Date;

  @ApiProperty({
    type : String,
    description : `oid`
  })
  oid : string;

  @ApiProperty({
    type : String,
    default : '8752a563-970f-4ce2-acf5-6f9ba2d9d5be',
    required : true
  })
  @IsNotEmpty()
  business_id : string;
}