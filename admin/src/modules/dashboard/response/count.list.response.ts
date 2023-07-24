import { ApiProperty } from "@nestjs/swagger";

class CountList {
  @ApiProperty({
    type : String,
    default : '3'
  })
  count : string;

  @ApiProperty({
    type : String,
    default : '20221027'
  })
  date : string;
}

export class CountListResponse {
  @ApiProperty({
    type : [CountList]
  })
  user : [CountList];

  @ApiProperty({
    type : [CountList]
  })
  business : [CountList];

  @ApiProperty({
    type : [CountList]
  })
  connected : [CountList];
}