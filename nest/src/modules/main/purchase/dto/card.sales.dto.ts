import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CardSalesDto {
  @ApiProperty({
    type : String,
    default : '20221214',
    description : 'trDt',
    required : true
  })
  @IsString()
  date : string;

  @ApiProperty({
    type : String,
    default : '33464823',
    description : 'apprNo',
    required : true
  })
  @IsString()
  approval_no : string

  @ApiProperty({
    type : String,
    default : '4221-55*-*-*',
    description : 'cardNo',
    required : true
  })
  @IsString()
  card_no : string;
}