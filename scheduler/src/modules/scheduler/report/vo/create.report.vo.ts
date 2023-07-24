export class CreateReportVO {
  type : number;
  sales : number;
  before_sales : number;
  expeced_deposit : number;
  percent : number;
  date : string;
  constructor(
    type : number,
    sales : number,
    before_sales : number,
    expeced_deposit : number,
    percent : number,
    date : string,
  ) {
    this.type = type;
    this.sales = sales;
    this.before_sales = before_sales;
    this.expeced_deposit = expeced_deposit;
    this.percent = percent;
    this.date = date;
  }
}