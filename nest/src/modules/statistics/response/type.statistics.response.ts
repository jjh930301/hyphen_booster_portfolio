import { ApiProperty } from "@nestjs/swagger";
import { TotalCount } from "./time.statistics.response";

class TypeStatistics {
  @ApiProperty({
    type : TotalCount,
  })
  card : TotalCount;

  @ApiProperty({
    type : TotalCount,
  })
  cash : TotalCount;

  @ApiProperty({
    type : TotalCount,
  })
  bill : TotalCount;

  @ApiProperty({
    type : TotalCount,
  })
  delivery : TotalCount;
}

export class TypeStatisticsResponse {
  @ApiProperty({
    type : TypeStatistics
  })
  data : TypeStatistics
}