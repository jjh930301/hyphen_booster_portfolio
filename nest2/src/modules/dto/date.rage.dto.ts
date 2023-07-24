import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class DateRangeDto {
  @ApiProperty({
    type : String,
    example : '20220801',
    required : false,
  })
  @IsOptional()
  start_date : string;

  @ApiProperty({
    type : String,
    example : '20220831',
    required : false
  })
  @IsOptional()
  end_date : string;
}