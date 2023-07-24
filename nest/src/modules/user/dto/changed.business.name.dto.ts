import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ChangedBusinessNameDto {
  @ApiProperty({
    type : String,
    description : `business UUID`
  })
  @IsString()
  id : string

  @ApiProperty({
    type : String,
    description : '사업장 이름'
  })
  @IsString()
  name : string;
}