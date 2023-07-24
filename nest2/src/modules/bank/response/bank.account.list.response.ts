import { ApiProperty } from "@nestjs/swagger";

class BankAccountList {
  @ApiProperty({
    type : String,
    default :  "045f7088-10d3-4254-9369-102a4e175b34",
    description : `bank uuid`
  })
  id: string;

  @ApiProperty({
    type : String,
    default :  "2070155978506",
    description : `계좌번호`
  })
  account: string;

  @ApiProperty({
    type : String,
    default : "BNK모바일입출금통장_보통예금",
    description : `계좌이름`
  })
  account_name: string;

  @ApiProperty({
    type : String,
    default :  "1",
    description : `
    0 : 연결되지 않음 
    1 : 공동인증서로 연결
    2 : ID PW로 연결`
  })
  connect_type: string;

  @ApiProperty({
    type : Number,
    default :  1,
    description : `1 : 개인 / 2 : 법인`
  })
  type: number;

  @ApiProperty({
    type : Number,
    default :  0,
    description : `0 : none / 1 : 선정산 계좌`
  })
  is_paid: number;

  @ApiProperty({
    type : String,
    default :  "039",
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
  bank_type: string;

}

export class BankAccountListResponse {
  @ApiProperty({
    type : [BankAccountList]
  })
  banks : [BankAccountList]
}