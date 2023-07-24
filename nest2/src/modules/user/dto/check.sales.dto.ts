import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CheckSsalesDto {
  @ApiProperty({
    type : String,
    description : '영업단 id',
    example : 'sales1',
    required : true
  })
  @IsNotEmpty()
  sales_id : string;
}