import { ApiProperty } from "@nestjs/swagger";
class AccountList {
  @ApiProperty({
    type : String,
    default : "2070155978506",
    description : '계좌번호'
  })
  acctNo: string;
  @ApiProperty({
    type : String,
    default : "BNK모바일입출금통장_보통예금",
    description : '계좌명'
  })
  acctNm: string;
  @ApiProperty({
    type : String,
    default : "",
    description : ''
  })
  acctTp: string;
  @ApiProperty({
    type : String,
    default : "20230223",
    description : '신규일'
  })
  openDt: string;
  @ApiProperty({
    type : String,
    default : "",
    description : '만기일'
  })
  endDt: string;
  @ApiProperty({
    type : String,
    default : "550",
    description : '잔액'
  })
  balance: string;
  @ApiProperty({
    type : String,
    default : "",
    description : '통화코드'
  })
  curCd: string;
  @ApiProperty({
    type : String,
    default : "550",
    description : '출금가능액'
  })
  ablBal: string;
  @ApiProperty({
    type : String,
    default : "",
    description : '예금주'
  })
  acctHolder: string;
}
export class AccountListResponse {
  @ApiProperty({
    type : [AccountList]
  })
  accounts : [AccountList]
}