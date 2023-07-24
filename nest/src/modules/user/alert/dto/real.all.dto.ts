import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";

export class ReadAllDto {
  @ApiProperty({
    type : [String],
    description : 'alert UUID'
  })
  @IsArray()
  ids : [string];
}