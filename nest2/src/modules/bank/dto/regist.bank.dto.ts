import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class RegistBankDto {
  @ApiProperty({
    type : String,
    description : '계좌번호',
    required : true
  })
  @IsNotEmpty()
  account : string;

  @ApiProperty({
    type : String,
    description : '계좌 이름',
    required : true
  })
  @IsNotEmpty()
  account_name : string;

  @ApiProperty({
    type : String,
    description : '계좌 비밀번호 우리은행인 경우',
    required : false
  })
  @IsOptional()
  account_password : string;

  @ApiProperty({
    type : Number,
    description : `
      1 : 개인
      2 : 법인
    `,
    required : false
  })
  @IsNotEmpty()
  type : number;

  @ApiProperty({
    type : String,
    description : `
    산업 = '002' 
    기업 = '003' 
    KB국민 = '004' 
    수협 = '007' 
    농협 = '011' 
    우리 = '020' 
    SC제일 = '023' 
    씨티 = '027' 
    대구 = '031' 
    부산 = '032' 
    광주 = '034' 
    제주 = '035' 
    전북 = '037' 
    경남 = '039' 
    새마을금고 = '045' 
    신협 = '048' 
    NFCF = '064',
    우체국 = '071' 
    우체국 = '079' 
    하나 = '081' 
    신한 = '088' 
    K뱅크 = '089' 
    카카오뱅크 = '090' 법인만 가능합니다.
    `,
    required : true
  })
  @IsNotEmpty()
  bank_type : string;

  @ApiProperty({
    type : String,
    description : `
      공인인증서로 등록했을 경우
    `,
    required : false
  })
  @IsOptional()
  cert_num : string;

  cert : string = null;

  pri : string = null;

  cert_password : string;

  @ApiProperty({
    type : String,
    description : '계정으로 등록한 경우',
    required : false
  })
  @IsOptional()
  bank_id : string;

  @ApiProperty({
    type : String,
    description : '계정으로 등록한 경우',
    required : false
  })
  @IsOptional()
  bank_password : string;

  is_paid : number = 0;

}