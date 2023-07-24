import { ApiProperty } from "@nestjs/swagger";

class PurchaseDetail {
  @ApiProperty({
    default : "29700",
    type : String,
    description : `입금예정금액`
  })
  payAmt: string;

  @ApiProperty({
    default : "2022-12-20T00:00:00.000Z",
    type : String,
    description : `입금예정일`
  })
  payDt: string;

  @ApiProperty({
    default : "300",
    type : String,
    description : `수수료`
  })
  comm: string;

}

export class PurchaseDetailResponse {
  @ApiProperty({
    type : PurchaseDetail
  })
  result : PurchaseDetail
}