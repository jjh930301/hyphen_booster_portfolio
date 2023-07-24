import { ApiProperty } from "@nestjs/swagger";

export class ReportTypeDto {
  @ApiProperty({
    type : Number,
    default : 1,
    required : false,
    description : `
      1 : 일일
      2 : 월간
    `
  })
  type : number

}