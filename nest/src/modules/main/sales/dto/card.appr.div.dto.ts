import { ApiProperty } from "@nestjs/swagger";

export class CardApprDivDto {
  @ApiProperty({
    type : Number,
    default : 1,
    required : false,
    description : `1 : 승인 , 2 : 취소`
  })
  appr_div : number;
}