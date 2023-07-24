import { ApiProperty } from "@nestjs/swagger";

export class ApprovalRangeDto {
  @ApiProperty({
    type : String,
    description : `business_id`
  })
  public business_id : string;

  @ApiProperty({
    type : String,
    default : '2022-03-21'
  })
  public start_date : string;

  @ApiProperty({
    type : String,
    default : '2022-03-22'
  })
  public end_date : string;
}