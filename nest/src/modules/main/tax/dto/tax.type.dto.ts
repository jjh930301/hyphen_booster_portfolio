import { ApiProperty } from "@nestjs/swagger";

export class TaxTypeDto {
  @ApiProperty({
    type : Number,
    description : `
      1 : 매출 / 2 : 매입 / 0 : 매입,매출
      값을 넣지 않으면 매출로 값을 가져옵니다.
    `,
    default : 1,
    required : false
  })
  type : number;
}