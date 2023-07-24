import { SchemaNames } from "src/constants/schema.names"

export class SelectHelper {

  static client_user_select : Array<string> = [
    'users.id' , 
    'users.name' , 
    'users.mobile' ,
    'users.mobile_company' ,
    'users.gender' , 
    'users.date_of_birth' ,
    'users.kakao_alert',
    'devices.id',
    'devices.device_name',
    'devices.vendor_id',
    'devices.card_sales_approval_alert',
    'devices.cash_sales_approval_alert',
    'devices.card_sales_cancel_alert',
    'devices.cash_sales_cancel_alert',
    'devices.unpaid_unpurchase_alert',
    'devices.report_alert',
    'devices.token',
    'businesses.id',
    'businesses.business_number',
    'businesses.store_name',
    'businesses.type',
    'businesses.h_id',
  ]

  static user_select : Array<string> = [
    ...this.client_user_select,
    'businesses.member_group_id',
    'businesses.crefia_id',
    'businesses.crefia_updated_at',
    'businesses.crefia_login',
    'businesses.hometax_id',
    'businesses.hometax_updated_at',
    'businesses.hometax_login',
    'businesses.baemin_id',
    'businesses.baemin_updated_at',
    'businesses.baemin_login',
    'businesses.yogiyo_id',
    'businesses.yogiyo_updated_at',
    'businesses.yogiyo_login',
    'businesses.coupange_id',
    'businesses.coupange_updated_at',
    'businesses.coupange_login',
    'businesses.created_at',
    'businesses.type',
    'businesses.is_ksnet',
    'businesses.agreemented_at',
  ]

  static crefia_select : Array<string> = [
    'users.id',
    'businesses.crefia_id',
    'businesses.crefia_password',
    'businesses.id',
    'businesses.business_number',
    'businesses.store_name',
    'businesses.type',
    'businesses.crefia_login',
    'businesses.created_at'
  ];

  static user_device_select : Array<string> = [
    'users.id' , 
    'users.kakao_alert',
    'devices.card_sales_approval_alert',
    'devices.cash_sales_approval_alert',
    'devices.card_sales_cancel_alert',
    'devices.cash_sales_cancel_alert',
    'devices.unpaid_unpurchase_alert',
    'devices.report_alert',
  ]
  static business_select : Array<string> = [
    'business.id',
    'business.business_number',
    'business.store_name',
    'business.id',
    'users.id',
    'users.name'
  ]

  static whenCardCondition = (
    table : string,
    cardColumn : string,
    code : string,
    value : string
  ) : string => {
    return `WHEN ${table}.${cardColumn} = '${code}' THEN '${value}' `;
  }
}