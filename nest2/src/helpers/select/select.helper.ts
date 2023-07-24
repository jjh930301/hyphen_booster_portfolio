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
    'businesses.is_paid',
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

  static bank_history_select : Array<string> = [
    `${SchemaNames.business_bank}.bank_type as bank_type`,
    `${SchemaNames.business_bank}.account_name as account_name`,
    `${SchemaNames.business_bank}.account as account`,
    `${SchemaNames.bank_history}.bank as bank`,
    `${SchemaNames.bank_history}.business as business`,
    `${SchemaNames.bank_history}.trade_date as trade_date`,
    `${SchemaNames.bank_history}.trade_turnover as trade_turnover`,
    `${SchemaNames.bank_history}.trade_month as trade_month`,
    `${SchemaNames.bank_history}.in_amount as in_amount`,
    `${SchemaNames.bank_history}.out_amount as out_amount`,
    `${SchemaNames.bank_history}.balance as balance`,
    `${SchemaNames.bank_history}.trade_branch as trade_branch`,
    `${SchemaNames.bank_history}.trade_name as trade_name`,
    `${SchemaNames.bank_history}.trade_desc as trade_desc`,
    `${SchemaNames.bank_history}.trade_detail as trade_detail`,
    `${SchemaNames.bank_history}.memo as memo`,
    `${SchemaNames.bank_history}.currency_code as currency_code`,
    `${SchemaNames.bank_history}.receive_account_no as receive_account_no`,
    `${SchemaNames.bank_history}.receive_account_holder as receive_account_holder`,
    `${SchemaNames.bank_history}.send_account_no as send_account_no`,
    `${SchemaNames.bank_history}.send_account_holder as send_account_holder`
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