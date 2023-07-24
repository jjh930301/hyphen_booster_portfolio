import { SchemaNames } from "src/constants/schema.names"

export class SelectHelper {
  static user_select : Array<string> = [
    'users.id' , 
    'users.name' , 
    'users.mobile' , 
    'users.kakao_alert',
    'businesses.crefia_id',
    'businesses.crefia_password',
    'devices.device_name',
    'devices.card_sales_approval_alert',
    'devices.cash_sales_approval_alert',
    'devices.card_sales_cancel_alert',
    'devices.cash_sales_cancel_alert',
    'devices.unpaid_unpurchase_alert',
    'devices.report_alert',
    'devices.token',
    'businesses.id',
    'businesses.business_number',
    'businesses.member_group_id',
    'businesses.store_name',
    'businesses.cert_number',
    'businesses.type',
    'businesses.h_id',
  ]

  private static user : Array<string> = [
    'users.id' , 
    'users.name' , 
    'users.mobile' , 
    'users.kakao_alert',
    'businesses.id',
    'businesses.business_number',
    'businesses.member_group_id',
    'businesses.store_name',
    'businesses.type'
  ];

  static user_crefia_select : Array<string> = [
    ...this.user,
    'businesses.crefia_id',
    'businesses.crefia_password',
    'businesses.crefia_login',
  ]

  static user_hometax_select : Array<string> = [
    ...this.user,
    'businesses.hometax_id',
    'businesses.hometax_password',
    'businesses.hometax_login',
  ];

  static user_hometax_cert_select : Array<string> = [
    ...this.user,
    'businesses.cert',
    'businesses.pri',
    'businesses.cert_password',
    'businesses.cret_updated_at',
    'businesses.hometax_login'
  ]

  static user_baemin_select : Array<string> = [
    ...this.user,
    'businesses.baemin_id',
    'businesses.baemin_password',
    'businesses.baemin_login',
  ];

  static user_yogiyo_select : Array<string> = [
    ...this.user,
    'businesses.yogiyo_id',
    'businesses.yogiyo_password',
    'businesses.yogiyo_login',
  ];

  static user_coupange_select : Array<string> = [
    ...this.user,
    'businesses.coupange_id',
    'businesses.coupange_password',
    'businesses.coupange_login',
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