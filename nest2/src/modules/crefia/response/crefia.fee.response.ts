import { ApiProperty } from "@nestjs/swagger";
class CrefiaFee {
  @ApiProperty({
    default : "KB카드",
    type : String
  })
  card_name: string;
  @ApiProperty({
    default : "000008947991",
    type : String
  })
  member_group_id: string;
}

export class CrefiaFeeResponse {
  @ApiProperty({
    type : [CrefiaFee]
  })
  fee : [CrefiaFee]
}