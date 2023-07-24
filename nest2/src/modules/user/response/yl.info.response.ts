import { ApiProperty } from "@nestjs/swagger";

export class YLInfoResponse {
  @ApiProperty({
    type : String,
    example : "b6249a2b-b610-4624-9cd5-97e35fe02384",
    description : ``
  })
  business_uuid: string;
  @ApiProperty({
    type : String,
    example : "01093569438",
    description : `가맹점id`
  })
  ylsolution_id: string;
  @ApiProperty({
    type : Number,
    example : 1,
    description : `결과 상태(부스터 미가입 가맹점은 3:반려로 보냄)`
  })
  status: number;
  @ApiProperty({
    type : Number,
    example : 1,
    description : `
    1 : 개인
    2 : 법인
    `
  })
  kyungnam_account_type: number;
  @ApiProperty({
    type : String,
    example : "2210056870809",
    description : `경남은행 계좌번호`
  })
  kyungnam_account: string;
  @ApiProperty({
    type : Number,
    example : 1,
    description : `
    1 : 개인
    2 : 법인
    `
  })
  paid_account_type: number;
  @ApiProperty({
    type : String,
    example : "004",
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
    `
  })
  paid_account_bank_type: string;
  @ApiProperty({
    type : String,
    example : "20550200000000",
    description : `정산받는 계좌`
  })
  paid_account: string;
  @ApiProperty({
    type : String,
    example : "skycoco",
    description : `영업사원 id`
  })
  sales_person_id: string;
  @ApiProperty({
    type : String,
    example : "01012345678",
    description : `영업사원 휴대폰 번호`
  })
  sales_person_mobile: string;
  @ApiProperty({
    type : String,
    example : "2023-02-13",
    description : `계약일`
  })
  contracted_at: string;
  @ApiProperty({
    type : String,
    example : "2023-02-16",
    description : `출금시작일자`
  })
  withdrawaled_at: string;
  @ApiProperty({
    type : String,
    example : "loveandna1",
    description : ``
  })
  credit_id: string;
  @ApiProperty({
    type : String,
    example : "qkrwngus2@",
    description : `key가 존재하지 않습니다`
  })
  credit_password: string;
  @ApiProperty({
    type : String,
    example : "",
    description : ``
  })
  baemin_id: string;
  @ApiProperty({
    type : String,
    example : "",
    description : `key가 존재하지 않습니다`
  })
  baemin_password: string;
  @ApiProperty({
    type : String,
    example : "",
    description : ``
  })
  yogiyo_id: string;
  @ApiProperty({
    type : String,
    example : "",
    description : `key가 존재하지 않습니다`
  })
  yogiyo_password: string;
}

export class YLInfoModel {
  @ApiProperty({
    type : Boolean,
    example : true
  })
  success: boolean;
  @ApiProperty({
    type : String,
    example : ""
  })
  message: string;

  @ApiProperty({
    type : [YLInfoResponse],
  })
  data : [YLInfoResponse]
}