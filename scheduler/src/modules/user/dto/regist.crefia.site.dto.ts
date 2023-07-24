import { ApiProperty } from "@nestjs/swagger";

export class RegistCrefiaSiteDto {

  @ApiProperty({
    type : String,
    description : '사용할 계정'
  })
  userId : string;

  @ApiProperty({
    type : String,
    description : '사용할 패스워드'
  })
  userPw : string;

  @ApiProperty({
    type : String,
    description : '회원명'
  })
  userNm : string;

  @ApiProperty({
    type : String,
    description : '메일주소'
  })
  email : string;

  @ApiProperty({
    type : String,
    description : '통신사'
  })
  mobileCo : string;

  @ApiProperty({
    type : String,
    description : '휴대폰 번호'
  })
  mobileNo : string;

  @ApiProperty({
    type : String,
    description : '주민번호 앞자리'
  })
  ssnFront : string;

  @ApiProperty({
    type : String,
    description : '주민번호 뒷자리 한자리'
  })
  ssnBack : string;

  @ApiProperty({
    type : String,
    description : '사업자번호'
  })
  bizNo : string;

  @ApiProperty({
    type : String,
    description : '법인번호'
  })
  corpNo : string;

  @ApiProperty({
    type : String,
    description : '가맹점명'
  })
  merNm : string;

  @ApiProperty({
    type : String,
    description : '대표자명'
  })
  rsvNm : string;

  @ApiProperty({
    type : String,
    description : '대표자 생년월일'
  })
  rsvNo : string;

  @ApiProperty({
    type : String,
    description : `
      01 : KB
      03 : 신한
      04 : 비씨
      11 : 롯데
      12 : 현대
      13 : 삼성
      18 : 씨티
      19 : 농협
      21 : 하나
    `
  })
  cardCd : string;

  @ApiProperty({
    type : String,
    description : '결제 은행사 코드'
  })
  bankCd : string;

  @ApiProperty({
    type : String,
    description : '결제 계좌번호'
  })
  acctNo : string;
}