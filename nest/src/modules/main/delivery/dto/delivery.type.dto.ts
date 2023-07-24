import { ApiProperty } from "@nestjs/swagger";

export class DeliveryTypeDto {
  @ApiProperty({
    type : Number,
    default : 1,
    description : `
      1 : 온라인결제
      2 : 오프라인결제
      빈값 : 전체
    `,
    required : false
  })
  payment_type : number;
}