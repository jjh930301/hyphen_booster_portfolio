import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class DateRangeDto {
  @ApiProperty({
    type : String,
    example : '20220801',
    required : false,
  })
  start_date : string;

  @ApiProperty({
    type : String,
    example : '20220831',
    required : false
  })
  end_date : string;
}