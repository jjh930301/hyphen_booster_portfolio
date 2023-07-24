import { ApiProperty } from "@nestjs/swagger";

export class ChangedAlertDto {
	@ApiProperty({
		type : String,
		description : '사용하고 있는 디바이스 id'
	})
	device_id : string;

	@ApiProperty({
		type : Boolean,
		description : '카카오 알림'
	})
	kakao_alert : boolean;

	@ApiProperty({
		type : Boolean,
		description : '카드 승인 알림'
	})
	card_sales_approval_alert : boolean;

	@ApiProperty({
		type : Boolean,
		description : '현금 승인 알림'
	})
	cash_sales_approval_alert : boolean;

	@ApiProperty({
		type : Boolean,
		description : '카드 취소 알림'
	})
	card_sales_cancel_alert : boolean;

	@ApiProperty({
		type : Boolean,
		description : '현금 취소 알림'
	})
	cash_sales_cancel_alert : boolean;

	@ApiProperty({
		type : Boolean,
		description : '리포트 알림'
	})
	report_alert : boolean;

	@ApiProperty({
		type : Boolean,
		description : '미매입/미입금 알림'
	})
  unpaid_unpurchase_alert : boolean;
}