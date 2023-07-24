import { ApiProperty } from "@nestjs/swagger";

export class AgreeDto {
  @ApiProperty({
    type : Number,
    description : `
      1 : 동의,
      2 : 비동의
    `
  })
  is_agree : number
}