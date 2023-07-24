import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class PaginationDto {
  @ApiProperty({
    type : Number,
    default : 0
  })
  @IsNumber()
  page : number

  @ApiProperty({
    type : Number
  })
  @IsNumber()
  count : number;
}