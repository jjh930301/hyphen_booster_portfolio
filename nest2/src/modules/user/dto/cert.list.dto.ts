import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class CertListDto {
  @ApiProperty({
    type : String,
    required : false,
  })
  @IsOptional()
  business_id : string;
}