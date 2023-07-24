import { ApiProperty } from "@nestjs/swagger";

class Alerts {
  @ApiProperty({
    type : String,
    default : "uuid"
  })
  id : string;
  @ApiProperty({
    type : String,
    default : "여신금융협회 데이터 불러오기 완료!"
  })
  title : string;
  @ApiProperty({
    type : String,
    default : "사장님의 카드 매출 정보를 모두 불러왔어요. (최대 2년)\n\n✔ 카드 매출 내역 조회 \n\n✔ 카드 매출 누락 확인 \n\n✔ 기간별, 시간대별, 요일별 등 다양한 통계 "
  })
  body : string;
  @ApiProperty({
    type : String,
    default : "uuid"
  })
  event : string;
  @ApiProperty({
    type : Number,
    default : 101
  })
  event_type : number;
  @ApiProperty({
    type : Boolean,
    default : false
  })
  is_public : boolean;
  @ApiProperty({
    type : Boolean,
    default : false
  })
  is_read : boolean;
  @ApiProperty({
    type : String,
    default : "2022-10-20T16:58:37.455Z"
  })
  created_at : string;
  @ApiProperty({
    type : String,
    default : "2022-10-20T16:58:37.455Z"
  })
  updated_at : string;
  @ApiProperty({
    type : String,
    default : null
  })
  deleted_at : string;
}

export class AlertsResponse {
  @ApiProperty({
    type : [Alerts]
  })
  alerts : [Alerts]
}