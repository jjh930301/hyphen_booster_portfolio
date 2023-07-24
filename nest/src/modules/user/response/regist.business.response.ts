import { ApiProperty } from "@nestjs/swagger";

export class RegistBusinessResponse {
  @ApiProperty({
    type : String
  })
  id : string;

  @ApiProperty({
    type : String
  })
  business_number : string;

  @ApiProperty({
    type : String
  })
  member_group_id : string;

  @ApiProperty({
    type : String
  })
  store_name : string;

  @ApiProperty({
    type : Number
  })
  type : number;
}