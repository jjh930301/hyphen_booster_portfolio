import { ApiProperty } from "@nestjs/swagger";

export class PaginationDto {
  @ApiProperty({
    type : String
  })
  page : string;

  @ApiProperty({
    type : String
  })
  count : string;
}