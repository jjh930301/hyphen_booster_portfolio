import { ApiProperty } from "@nestjs/swagger";
import { TotalCount } from "./time.statistics.response";

class DayStatistics {
  @ApiProperty({
    type : TotalCount
  })
  monday : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  tuesday : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  wednesday : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  thursday : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  friday : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  saturday : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  sunday : TotalCount;
}

export class DayStatisticsResponse {
  @ApiProperty({
    type : DayStatistics
  })
  statistics : DayStatistics
}