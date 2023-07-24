import { ApiProperty } from "@nestjs/swagger";

class BankHistory {
  @ApiProperty({
    type : String,
    example : "003",
    description : `은행 타입`
  })
  bank_type: string;

  @ApiProperty({
    type : String,
    example : "보통예금",
    description : `계좌명`
  })
  account_name: string;

  @ApiProperty({
    type : String,
    example : "01108330000000",
    description : `계좌번호`
  })
  account: string;

  @ApiProperty({
    type : String,
    example : "8752a563-970f-4ce2-acf5-6f9ba2d9d5be",
    description : `busiess uuid`
  })
  business: string;

  @ApiProperty({
    type : String,
    example : "2021-05-04T11:01:48.000Z",
    description : `거래일`
  })
  trade_date: string;

  @ApiProperty({
    type : String,
    example : null,
    description : `납입회차`
  })
  trade_turnover: string;

  @ApiProperty({
    type : String,
    example : null,
    description : `월분`
  })
  trade_month: string;

  @ApiProperty({
    type : String,
    example : "0",
    description : `입금액`
  })
  in_amount: string;

  @ApiProperty({
    type : String,
    example : "1633094",
    description : `출금액`
  })
  out_amount: string;

  @ApiProperty({
    type : String,
    example : "0",
    description : `잔액`
  })
  balance: string;

  @ApiProperty({
    type : String,
    example : "대체",
    description : `거래점명`
  })
  trade_branch: string;

  @ApiProperty({
    type : String,
    example : "토스 구자영",
    description : `거래자명`
  })
  trade_name: string;

  @ApiProperty({
    type : String,
    example : "대체",
    description : `거래내용`
  })
  trade_desc: string;

  @ApiProperty({
    type : String,
    example : null,
    description : `거래내용상세`
  })
  trade_detail: string;

  @ApiProperty({
    type : String,
    example : null,
    description : `송금메모`
  })
  memo: string;

  @ApiProperty({
    type : String,
    example : null,
    description : `통화코드`
  })
  currency_code: string;

  @ApiProperty({
    type : String,
    example : null,
    description : `상대방 계좌번호`
  })
  receive_account_no: string;

  @ApiProperty({
    type : String,
    example : null,
    description : `받는사람 예금주`
  })
  receive_account_holder: string;

  @ApiProperty({
    type : String,
    example : null,
    description : `입금시 입금계좌번호`
  })
  send_account_no: string;

  @ApiProperty({
    type : String,
    example : null,
    description : `입금시 입금계좌 예금주`
  })
  send_account_holder: string;

}
export class BalanceResponse {
  @ApiProperty({
    type : [BankHistory]
  })
  balances : [BankHistory]
}

export class HistoryResponse {
  @ApiProperty({
    type : [BankHistory]
  })
  histories : [BankHistory]
}