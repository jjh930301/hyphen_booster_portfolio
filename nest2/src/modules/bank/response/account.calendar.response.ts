import { ApiProperty } from "@nestjs/swagger";

class AccountCalendar {
  @ApiProperty({
    type : String,
    default : "20220805",
    description : `거래일`
  })
  trDt: string;

  @ApiProperty({
    type : String,
    default : "500000",
    description : `입금액`
  })
  inAmt: string;

  @ApiProperty({
    type : String,
    default : "500000",
    description : `춮금액`
  })
  outAmt: string;

}

export class AccountCalenderResponse {
  @ApiProperty({
    type : [AccountCalendar]
  })
  calendar : [AccountCalendar]
}