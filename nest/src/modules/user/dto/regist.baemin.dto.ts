import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RegistBaeminDto {
  @ApiProperty({
    type : String,
    description : '배달의민족 ID',
    required : true
  })
  @IsNotEmpty()
  baemin_id : string;

  @ApiProperty({
    type : String,
    description : '배달의민족 PW',
    required : true
  })
  @IsNotEmpty()
  baemin_password : string;

  @ApiProperty({
    type : String,
    description : '배달의민족 가맹점 번호',
    required : false
  })
  baemin_store_id : string;
}