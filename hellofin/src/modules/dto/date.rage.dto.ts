import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class DateRangeDto {
  @ApiProperty({
    type : String,
    example : '20230301',
    description : `최대 한달까지만 조회할 수 있습니다.`,
    required : true,
  })
  @IsNotEmpty()
  start_date : string;

  @ApiProperty({
    type : String,
    example : '20230331',
    description : `최대 한달까지만 조회할 수 있습니다.`,
    required : true
  })
  @IsNotEmpty()
  end_date : string;
}