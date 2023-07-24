import { ApiProperty } from "@nestjs/swagger";

class TaxList {

  @ApiProperty({
    type : String,
    default : '20220627-10000000-46223081',
    description : '승인번호'
  })
  issueNoDisp : string;

  @ApiProperty({
    type : String,
    default : '2022-06-30',
    description : '공급일'
  })
  makeDt: string;

  @ApiProperty({
    type : String,
    default : '2022-07-07',
    description : '발급일'
  })
  issueDt: string;

  @ApiProperty({
    type : String,
    default : '2022-07-07',
    description : '전송일'
  })
  sendDt: string;

  @ApiProperty({
    type : Number,
    default : 2,
    description : '1 : 매출 , 2 : 매입'
  })
  division: number;

  @ApiProperty({
    type : String,
    default : '여기어때 예약대행수수료_일반예약',
    description : '품목명'
  })
  itemName: string;

  @ApiProperty({
    type : String,
    default : '(주)여기어때컴퍼니',
    description : '거래처명'
  })
  company: string;

  @ApiProperty({
    type : String,
    default : '7428600224',
    description : '거래처 사업자번호'
  })
  businessNo: string;

  @ApiProperty({
    type : String,
    default : '정명훈',
    description : '거래처 대표자명'
  })
  ceo: string;

  @ApiProperty({
    type : String,
    default : '860291',
    description : '공급가액'
  })
  supAmt: string;

  @ApiProperty({
    type : String,
    default : '86029',
    description : '세금'
  })
  taxAmt: string;

  @ApiProperty({
    type : String,
    default : '94632',
    description : '전체금액'
  })
  totAmt: string;
}

export class TaxListResponse {
  @ApiProperty({
    type : String,
    default : '24689496',
    description : '합계 금액'
  })
  total : string;

  @ApiProperty({
    type : [TaxList]
  })
  bills : [TaxList]
}