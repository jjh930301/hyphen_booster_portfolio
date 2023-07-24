import { ApiProperty } from "@nestjs/swagger";

export class ReportMonthlyStackResponse {
  @ApiProperty({
    default:"25105000",
    type :String
  })
  crefia: string;
  
  @ApiProperty({
    default:"55000",
    type :String
  })
  cash: string;
  
  @ApiProperty({
    default:"0",
    type :String
  })
  bill: string;
  
  @ApiProperty({
    default:"3699900",
    type :String
  })
  delivery: string;
  
}