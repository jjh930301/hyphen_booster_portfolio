import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class TypeDto {
  @ApiProperty({
    type : Number,
    default : 1,
    required : false,
    description : '1 : 승인 , 2 : 취소 | 빈값은 전체',
  })
  type : number;
}