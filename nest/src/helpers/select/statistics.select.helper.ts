export class StatisticsSelectHelper {

  static dateFormat = {
    0 : `'%Y%m%d'`,
    2 : `'%Y%m'`,
    3 : `'%Y'`
  }

  static daySelect = (select_date : string) : string => {
    return `CASE DAYOFWEEK(${select_date})
    WHEN 2 THEN "monday"
    WHEN 3 THEN "tuesday"
    WHEN 4 THEN "wednesday"
    WHEN 5 THEN "thursday"
    WHEN 6 THEN "friday"
    WHEN 7 THEN "saturday"
    WHEN 1 THEN "sunday"
      END AS day`;
  }

  static crefiaCardDate = (
    table : string, 
    type : number
  ) : string[] => {
    return [
      type === 1 ?
      `DATE_FORMAT(
        FROM_DAYS(
            TO_DAYS(${table}.trade_date) 
            - MOD(TO_DAYS(${table}.trade_date) -2, 7
          )
        ) , '%Y%m%d') AS date` : //주
      `DATE_FORMAT(${table}.trade_date , ${this.dateFormat[type]}) AS date`, //일 , 월 , 년
      `SUM(
        CASE 
          WHEN ${table}.trade_division = 1 
          THEN ${table}.approval_amount 
          WHEN ${table}.trade_division = 2 
          THEN -${table}.approval_amount 
        ELSE 0 END) AS total`,
      `COUNT(${table}.trade_division) AS count`,
    ]
    // `CONCAT(
    //   FROM_DAYS(
    //     TO_DAYS(${table}.trade_date) 
    //     - MOD(TO_DAYS(${table}.trade_date) -2, 7
    //     )
    //   ),
    //   '~',  
    //   DATE_FORMAT(
    //     DATE_ADD(
    //       ${table}.trade_date, 
    //       INTERVAL(8-DAYOFWEEK(${table}.trade_date)
    //     ) DAY
    //   ),'%Y-%m-%d')
    // ) AS date`
  }

  static crefiaCardDayOrTime = (
    table : string,
    type : number
  ) : string[]  => {
    return [
      type === 0 ? 
      `HOUR(${table}.trade_date) AS time` : 
      this.daySelect(`${table}.trade_date`),
      `SUM(
        CASE 
          WHEN ${table}.trade_division = 1 
          THEN ${table}.approval_amount 
          WHEN ${table}.trade_division = 2 
          THEN -${table}.approval_amount 
        ELSE 0 END) AS total`,
      `COUNT(${table}.trade_division) AS count`,
    ]
  }

  static cashSalesDate = (
    table : string,
    type : number
  ) : string[] => {
    return [
      type === 1 ?
      `DATE_FORMAT(
        FROM_DAYS(
            TO_DAYS(${table}.trade_date) 
            - MOD(TO_DAYS(${table}.trade_date) -2, 7
          )
        ) , '%Y%m%d') AS date` : //주별
      `DATE_FORMAT(${table}.trade_date , ${this.dateFormat[type]}) AS date `, //일 , 월 , 년
      `SUM(
        CASE
          WHEN ${table}.trade_type = 1 
          THEN ${table}.tip + ${table}.tax_amount + ${table}.supply_amount
          WHEN ${table}.trade_type = 2 
          THEN -${table}.tip -${table}.tax_amount -${table}.supply_amount
        ELSE 0 END
      ) AS total`,
      `COUNT(${table}.trade_type) AS count`
    ]
  }

  static cashSalesDayOrTime = (
    table : string,
    type : number
  ) : string[]  => {
    return [
      type === 0 ? 
      `HOUR(${table}.trade_date) AS time` : 
      this.daySelect(`${table}.trade_date`),
      `SUM(
        CASE
          WHEN ${table}.trade_type = 1 
          THEN ${table}.tip + ${table}.tax_amount + ${table}.supply_amount
          WHEN ${table}.trade_type = 2 
          THEN -${table}.tip -${table}.tax_amount -${table}.supply_amount
        ELSE 0 END
      ) AS total`,
      `COUNT(${table}.trade_type) AS count`
    ]
  }

  static taxSalesDate = (
    table : string,
    type : number
  ) : string[] => {
    return [
      type === 1 ? 
      `DATE_FORMAT(
        FROM_DAYS(
            TO_DAYS(${table}.make_date) 
            - MOD(TO_DAYS(${table}.make_date) -2, 7
          )
        ) , '%Y%m%d') AS date` : // 주별
      `DATE_FORMAT(${table}.make_date , ${this.dateFormat[type]}) AS date `, // 일 , 월 , 년
      `SUM(
        CASE 
          WHEN ${table}.division = 1 
          THEN ${table}.total_amount 
        ELSE 0 END) AS total`,
      `COUNT(
        IF(
          ${table}.division = 1, 
          ${table}.division, 
          null
        )
      ) AS count`,
    ]
  }

  static taxSalesDayOrTime = (
    table : string,
    type : number
  ) : string[] => {
    return [
      type === 0 ? 
      `HOUR(${table}.make_date) AS time` :
      this.daySelect(`${table}.make_date`),
      `SUM(
        CASE 
          WHEN ${table}.division = 1 
          THEN ${table}.total_amount 
        ELSE 0 END) AS total`,
      `COUNT(${table}.division) AS count`,
    ]
  }

  static deliverySalesDate = (
    table : string,
    type : number
  ) => {
    return [
      type === 1 ? 
      `DATE_FORMAT(
        FROM_DAYS(
            TO_DAYS(${table}.order_date) 
            - MOD(TO_DAYS(${table}.order_date) -2, 7
          )
        ) , '%Y%m%d') AS date` : //주별
      `DATE_FORMAT(${table}.order_date , ${this.dateFormat[type]}) AS date `, //일 , 월 , 년
      `SUM(
        CASE 
          WHEN ${table}.order_sub_division = 1 and ${table}.sales_amount != 0
          THEN ${table}.sales_amount 
          WHEN ${table}.order_sub_division = 1 and ${table}.sales_amount = 0
          THEN ${table}.order_amount 
        ELSE 0 END) AS orderTotal`,
      `SUM(
        CASE 
          WHEN ${table}.order_sub_division = 1 and ${table}.payment_sub_type = 1
          THEN ${table}.payment_amount 
        ELSE 0 END) AS total`,
      `COUNT(
        CASE
          WHEN ${table}.payment_sub_type = 1
          THEN ${table}.payment_sub_type
        ELSE null END) AS count`
    ]
  }

  static deliverySalesDayOrTime = (
    table : string,
    type : number
  ) => {
    return [
      type === 0 ? 
      `HOUR(${table}.order_date) AS time` :
      this.daySelect(`${table}.order_date`),
      `SUM(
        CASE 
          WHEN ${table}.order_sub_division = 1 and ${table}.sales_amount != 0
          THEN ${table}.sales_amount 
          WHEN ${table}.order_sub_division = 1 and ${table}.sales_amount = 0
          THEN ${table}.order_amount 
        ELSE 0 END) AS orderTotal`,
      `SUM(
        CASE 
          WHEN ${table}.order_sub_division = 1 and ${table}.payment_sub_type = 1
          THEN ${table}.payment_amount 
        ELSE 0 END) AS total`,
      `COUNT(
        CASE
          WHEN ${table}.payment_sub_type = 1
          THEN ${table}.payment_sub_type
        ELSE null END) AS count`
    ]
  }
}