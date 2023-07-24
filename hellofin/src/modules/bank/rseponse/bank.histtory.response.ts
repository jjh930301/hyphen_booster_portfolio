import { ApiProperty } from "@nestjs/swagger";
import { ResponseModel } from 'src/models/response.model';

class BankHistoryModel {
  
  @ApiProperty({
    default : '20230314',
    description : '거래일자',
    type : String
  })
  trDt: string = '20230314';

  @ApiProperty({
    default : '113500',
    description : '거래시간',
    type : String
  })
  trTm: string = '113500';

  @ApiProperty({
    default : '',
    description : '납입회차',
    type : String
  })
  trRnd: string = '납입회차';

  @ApiProperty({
    default : '',
    description : '월분',
    type : String
  })
  wlbn: string = '월분';

  @ApiProperty({
    default : '0',
    description : '입금액',
    type : String
  })
  inAmt: string = '0';

  @ApiProperty({
    default : '100',
    description : '출금액',
    type : String
  })
  outAmt: string = '100';

  @ApiProperty({
    default : '550',
    description : '잔액',
    type : String
  })
  balance: string = '550';

  @ApiProperty({
    default : '경남은행',
    description : '거래점명',
    type : String
  })
  trBr: string = '경남은행';

  @ApiProperty({
    default : '토뱅　구자영',
    description : '거래자명',
    type : String
  })
  trNm: string = '토뱅　구자영';

  @ApiProperty({
    default : '대체',
    description : '거래내용(적요)',
    type : String
  })
  trTp: string = '대체';

  @ApiProperty({
    default : '',
    description : '거래내용상세',
    type : String
  })
  trDetail: string = '거래내용상세';

  @ApiProperty({
    default : '',
    description : '송금메모',
    type : String
  })
  memo: string = '송금메모';

  @ApiProperty({
    default : '',
    description : '통화코드',
    type : String
  })
  curCd: string = '통화코드';

  @ApiProperty({
    default : '',
    description : '상대방 계좌번호',
    type : String
  })
  recvAcctNo: string = '상대방 계좌번호';

  @ApiProperty({
    default : '',
    description : '받는사람 예금주',
    type : String
  })
  recvAcctHolder: string = '받는사람 예금주';

  @ApiProperty({
    default : '',
    description : '입금시 입금계좌번호',
    type : String
  })
  sendAcctNo: string = '입금시 입금계좌번호';

  @ApiProperty({
    default : '',
    description : '입금시 입금계좌 예금주',
    type : String
  })
  sendAcctHolder: string = '입금시 입금계좌 예금주';

}

export class BankHistoryResponse extends ResponseModel(){
  @ApiProperty({
    type : [BankHistoryModel]
  })
  payload : [BankHistoryModel]
}