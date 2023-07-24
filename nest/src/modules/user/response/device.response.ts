import { ApiProperty } from "@nestjs/swagger";

export class DeviceResponse {
  @ApiProperty({
    type : String,
    default :'bdc535c3-80ba-4bfd-ad78-322aead4603c',
  })
  id:string;

  @ApiProperty({
    type : String,
    default : "string",
  })
  vendor_id:string;

  @ApiProperty({
    type : String,
    default : "iphone",
  })
  device_name:string;

  @ApiProperty({
    type : String,
    default : "string",
  })
  token:string;

  @ApiProperty({
    type : String,
    default : false,
  })
  card_sales_approval_alert:string;

  @ApiProperty({
    type : String,
    default : false,
  })
  cash_sales_approval_alert:string;

  @ApiProperty({
    type : String,
    default : true,
  })
  card_sales_cancel_alert:string;

  @ApiProperty({
    type : String,
    default : true,
  })
  cash_sales_cancel_alert:string;

  @ApiProperty({
    type : String,
    default : true
  })
  report_alert:string;

}