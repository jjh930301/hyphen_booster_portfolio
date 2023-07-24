import { ApiProperty } from "@nestjs/swagger";

export class DateRangeDto {
  @ApiProperty({
    type : String,
    required : false,
    example : '20221010',
    description : '시작 날짜'
  })
  start_date : string;

  @ApiProperty({
    type : String,
    required : false,
    example : '20221010',
    description : '종료 날짜'
  })
  end_date : string;
}