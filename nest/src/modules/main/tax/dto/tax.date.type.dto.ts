import { ApiProperty } from "@nestjs/swagger";

export class TaxDateTypeDto {
  @ApiProperty({
    type : Number,
    default : 1,
    description : `
      1 : 공급일
      2 : 발급일
      값을 넣지 않을 경우 공급일을 기준으로 가지고 옵니다
    `,
    required : false
  })
  date_type : number;
}