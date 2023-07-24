import { ApiProperty } from "@nestjs/swagger";

export class CountResponse {
  @ApiProperty({
    type : Number,
    default : 2
  })
  user : number;

  @ApiProperty({
    type : Number,
    default : 2
  })
  business : number;
}