import { ApiProperty } from "@nestjs/swagger";

export class AlertTypeDto {
  @ApiProperty({
    type : Number,
    description : `
      빈값 : 전체
      0 : 매출
      1 : 카드매출누락
      2 : 리포트
      3 : 문의답변
      4 : 공지사항
    `,
    required : false
  })
  type : number;
}