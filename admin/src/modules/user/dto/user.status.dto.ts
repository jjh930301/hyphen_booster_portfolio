import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumber } from "class-validator";

export class UserStatusDto {
  @ApiProperty({
    type : Number,
    required : true,
  })
  @IsNumber()
  @IsIn([0 , 1 , 2 , 3])
  status : number;
}