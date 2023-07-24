import { ApiProperty } from "@nestjs/swagger";

export class TotalCount {
  @ApiProperty({
    type : Number,
    default : 3110000
  })
  total : number;

  @ApiProperty({
    type : Number,
    default : 52
  })
  count : number;
}

class TimeStatistics {
  @ApiProperty({
    type : TotalCount
  })
  0 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  1 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  2 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  3 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  4 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  5 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  6 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  7 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  8 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  9 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  10 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  11 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  12 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  13 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  14 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  15 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  16 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  17 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  18 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  19 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  20 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  21 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  22 : TotalCount;

  @ApiProperty({
    type : TotalCount
  })
  23 : TotalCount;
}

export class TimeStatisticsResponse {
  @ApiProperty({
    type : TimeStatistics
  })
  statistics : TimeStatistics
}