import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
export class BankIdDto {
  @ApiProperty({
    type : String,
    description : `
      특정 은행만 조회할 경우
    `,
    required : false
  })
  @IsOptional()
  bank_id : string;
}