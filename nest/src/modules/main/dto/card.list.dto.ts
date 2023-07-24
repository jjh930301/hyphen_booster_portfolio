import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { CardName } from "src/enums/card.code";

export class CardListDto {
  @ApiProperty({
    default : '[1,2,3]',
    required : false,
    description : `
      전체 조회는 선택하지 않아도 됩니다.
      'KB카드' : 1,
      '비씨카드' : 2,
      '현대카드' : 3,
      '하나카드' : 4,
      '삼성카드' : 5,
      '신한카드' : 6,
      '롯데카드' : 7,
      '농협NH카드' : 8,
      '우리카드' : 9,
      '씨티은행' : 10,
    `
  })
  cards : string;
}