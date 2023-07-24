import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class OnedayServiceDto {
  @ApiProperty({
    type : String,
    description : '영업단 id',
    required : false
  })
  @IsOptional()
  sales_id : string;
}