import { ApiProperty } from "@nestjs/swagger";

export class DayWeekMonthTypeDto {
  @ApiProperty({
    type : Number,
    default : 0,
    required : false,
    description : `
      1 : 일
      2 : 주
      3 : 월
    `
  })
  type : number
}