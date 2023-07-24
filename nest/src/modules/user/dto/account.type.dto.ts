import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class AccountTypeDto {
  @ApiProperty({
    type : Number,
    description : `
      나머지 값이 추가될 수 있습니다.
      0 : 여신금융협회
      1 : 홈택스
      2 : 배민
      3 : 요기요
      4 : 쿠팡이츠
      5 : 공동인증서
    `
  })
  @IsNumber()
  account_type : number;
}