import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class StatisticsTypeDto {
  @ApiProperty({
    type : Number,
    description : `
      0 : 일
      1 : 주
      2 : 월
      3 : 년
    `
  })
  @IsNumber()
  type : number;
}