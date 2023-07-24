import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class InsertDto{
  @ApiProperty({
    type : String,
    description : `
      데이터를 받을 business_id
    `,
    required : true
  })
  @IsString()
  business_id : string;

  @ApiProperty({
    type : String,
    default : '20221201',
    description : `조회 시작날짜`
  })
  start_date : string;

  @ApiProperty({
    type : String,
    default : '20221231',
    description : `조회 시작날짜`
  })
  end_date : string;
}