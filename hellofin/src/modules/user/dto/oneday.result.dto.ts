import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class OnedayResultDto {
  @ApiProperty({
    type : String,
    description : '사업자 uuid',
    default : 'uuid',
    required : true
  })
  @IsNotEmpty()
  business_uuid : string;

  @ApiProperty({
    type : String,
    description : `
    ylsolution에서 사용하는 id
    ex) 01012345678
    `,
    required : true
  })
  @IsNotEmpty()
  ylsolution_id : string;

  @ApiProperty({
    type : Number,
    example : 1,
    description : `
    결과 상태
    1 : 승인
    3 : 반려
    4 : 해지
    `,
    required : true
  })
  @IsNotEmpty()
  status : number;

  @ApiProperty({
    type : Number,
    default : 1,
    description : `
    경남은행 게좌
      1 : 개인
      2 : 기업
    `,
    required : true
  })
  @IsNotEmpty()
  kyungnam_account_type : number;

  @ApiProperty({
    type : String,
    description : `
      경남은행 계좌번호 
      '-' 제외하고 보내주시면 됩니다.
    `,
    example : '2070155978506',
    required : true
  })
  kyungnam_account : string;

  @ApiProperty({
    type : Number,
    default : 1,
    description : `
      지급 계좌
      1 : 개인
      2 : 기업
    `,
    required : false
  })
  @IsOptional()
  paid_account_type : number

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
    example : '020',
    required : false
  })
  @IsOptional()
  paid_account_bank_type : string;

  @ApiProperty({
    type : String,
    description : `
    입금 계좌번호
    '-' 제외하고 보내주시면 됩니다.
    `,
    example : '17429487702001',
    required : false
  })
  @IsOptional()
  paid_account : string;

  @ApiProperty({
    type : String,
    description : `담당 영업 ID`,
    required : true
  })
  sales_person_id : string;

  @ApiProperty({
    type : String,
    description : `담당 영업 연락처`,
    required : true
  })
  sales_person_mobile : string;

  @ApiProperty({
    type : Date,
    description : `계약일`,
    example : '2023-04-04',
    required : true
  })
  @IsNotEmpty()
  contracted_at : Date;

  @ApiProperty({
    type : String,
    description : `출금시작일자`,
    example : '2023-04-04',
    required : false
  })
  @IsOptional()
  withdrawaled_at : string;

  @ApiProperty({
    type : String,
    description : `여신 id`,
    required : false
  })
  @IsOptional()
  credit_id : string;

  @ApiProperty({
    type : String,
    description : `여신 비밀번호`,
    required : false
  })
  @IsOptional()
  credit_password : string;

  @ApiProperty({
    type : String,
    description : `배달의 민족 id`,
    required : false
  })
  @IsOptional()
  baemin_id : string;

  @ApiProperty({
    type : String,
    description : `배달의민족 비밀번호`,
    required : false
  })
  @IsOptional()
  baemin_password : string;

  @ApiProperty({
    type : String,
    description : `요기요 id`,
    required : false
  })
  @IsOptional()
  yogiyo_id : string;

  @ApiProperty({
    type : String,
    description : `요기요 비밀번호`,
    required : false
  })
  @IsOptional()
  yogiyo_password : string;
}