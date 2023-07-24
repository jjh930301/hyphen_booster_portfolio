import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RegistBusinessDto {
  @ApiProperty({
    type : String,
    description : `
    사업자 번호
    2011836348
    1130152567 여신금융
    `,
    examples : ['2011836348','1130152567']
  })
  @IsNotEmpty()
  @IsString()
  business_number : string;

  // @ApiProperty({
  //   type : String,
  //   description : '사업장 이름',
  // })
  // @IsNotEmpty()
  // @IsString()
  // store_name : string;
}