import { ApiProperty } from "@nestjs/swagger";
import { TokenType } from "src/enums/token.type";

export class NewTokenDto {
  @ApiProperty({
    type : String,
    description : 'id'
  })
  id : string;

  @ApiProperty({
    type : String,
    description : `
      사업자 번호
      business_number
    `
  })
  unique : string;

  @ApiProperty({
    type : Number,
    description : `
      0 : user
    `,
    default : TokenType.user
  })
  token_type : number;
}