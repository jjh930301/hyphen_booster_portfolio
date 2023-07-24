import { ApiProperty } from "@nestjs/swagger";

class Crefia {
  @ApiProperty({
    default : "KB카드",
    type : String
  })
  cardCorp1: string;

  @ApiProperty({
    default : "120000",
    type : String
  })
  salesAmt: string;

  @ApiProperty({
    default : "3",
    type : String
  })
  salesCnt: string;

  @ApiProperty({
    default : "118725",
    type : String
  })
  realAmt: string;

}

class Delivery {
  @ApiProperty({
    default:0,
    type : Number
  })
  type: number;
  @ApiProperty({
    default:"154853",
    type : String
  })
  settleAmt: string;
  @ApiProperty({
    default:"1",
    type : String
  })
  sumCnt: string;
}

export class ReportDepositResponse {
  @ApiProperty({
    type : [Crefia]
  })
  crefia : [Crefia]

  @ApiProperty({
    type : [Delivery]
  })
  delivery : [Delivery]
}