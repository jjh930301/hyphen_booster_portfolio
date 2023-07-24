import { ApiProperty } from "@nestjs/swagger";
import { CardCode } from "src/enums/card.code";

export class DayDto {

  @ApiProperty({
    type : String,
    description : '검색어',
    required : false
  })
  word : string;

  @ApiProperty({
    type : Array,
    isArray : true,
    enum : CardCode,
    description : '카드 명 / 카드 코드',
    required : false,
    minLength : 1
  })
  card_code : string[];

  @ApiProperty({
    type : String,
    description : '승인 / 승인 취소',
    example : 'Y',
    required : false,
  })
  appr_yn : string;
  
}
