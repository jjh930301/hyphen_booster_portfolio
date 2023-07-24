import { ApiProperty } from "@nestjs/swagger";

export class CancelCardDto {
  @ApiProperty({
    type : String,
    description : '카드번호',
  })
  card_no : string;

  @ApiProperty({
    type : String,
    description : "승인번호"
  })
  appr_no
}