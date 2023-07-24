import { ApiProperty } from "@nestjs/swagger";

export class SearchDeliveryDto {
  @ApiProperty({
    type : Number,
    description : `
      주문 상태
      1 : 성공
      2 : 취소
      3 : 처리중
    `,
    required : false
  })  
  order_type : number;

  @ApiProperty({
    type : String,
    description : '주문번호 / 금액',
    required : false
  })
  word : string;
}