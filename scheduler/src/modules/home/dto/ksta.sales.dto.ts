import { ApiProperty } from "@nestjs/swagger"

export class KstaSalesDto {

  @ApiProperty({
    type : String,
    description : `사업자번호의 primary key`
  })
  business_id: string
  
  @ApiProperty({
    type : String,
    description : `최종 조회 페이지`
  })
  page: string
  
  @ApiProperty({
    type : String,
    description : `페이지당 조회 건수 (최대 3000)`
  })
  count: string
  
  @ApiProperty({
    type : String,
    description : `조회시작일자 format YYYYMMDD`
  })
  start_date: string
  
  @ApiProperty({
    type : String,
    description : `조회종료일자 format YYYYMMDD`
  })
  end_date: string
  
  @ApiProperty({
    type : String,
    description : `조회시작시각 format hhmmss`
  })
  start_time: string
  
  @ApiProperty({
    type : String,
    description : `조회종료시각 format hhmmss`
  })
  end_time: string
}