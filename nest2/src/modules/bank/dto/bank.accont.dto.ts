import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class BankAccountDto {
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
    `,
    required : true 
  })
  bankCd : string;

  @ApiProperty({
    type : String,
    description : `인증서 이름으로 찾아서 등록`,
    required : false
  })
  @IsOptional()
  cert_num : string;

  @ApiProperty({
    type : String,
    description : `
      은행 계좌로 연결시 사용 
      cert_num은 null
    `,
    required : false
  })
  @IsOptional()
  userId : string;

  @ApiProperty({
    type : String,
    description : `
      은행 계좌로 연결시 사용 
      cert_num은 null
    `,
    required : false
  })
  @IsOptional()
  userPw : string;

  @ApiProperty({
    type : String,
    description : `
      계좌번호
      *우리은행* 계좌로 연결시 사용 
      cert_num은 null
    `,
    required : false
  })
  @IsOptional()
  acctNo : string;

  @ApiProperty({
    type : String,
    description : `
      계좌번호
      *우리은행* 계좌로 연결시 사용 
      cert_num은 null
    `,
    required : false
  })
  @IsOptional()
  acctPw : string;

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
}