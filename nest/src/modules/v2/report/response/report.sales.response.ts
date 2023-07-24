import { ApiProperty } from "@nestjs/swagger";
import { ReportMonthlyStackResponse } from "./report.monthly.stack.response";

export class ReportSalesResponse {
  @ApiProperty({
    type : Number,
    default : 512100
  })
  before: number;
  @ApiProperty({
    type : Number,
    default : 1004100
  })
  today: number;
  @ApiProperty({
    type : String,
    default : '100.0',
    description : '100.0인 경우 전일과 동일'
  })
  per: string;
  @ApiProperty({
    type : ReportMonthlyStackResponse
  })
  sales : ReportMonthlyStackResponse;
}