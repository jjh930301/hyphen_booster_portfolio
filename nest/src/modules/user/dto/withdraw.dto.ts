import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class WithdrawDto {
  @ApiProperty({
    type : Number,
    description : '타입 0 ~ 3'
  })
  @IsNumber()
  type : number;

  @ApiProperty({
    type : String,
    description : 'description',
    required : false
  })
  description
}