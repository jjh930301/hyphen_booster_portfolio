export class RealtimeVO {

  private business_number : string;
  private total_amount : string
  private type : number

  constructor(
    business_number : string,
    total_amount : string,
    type : number
  ){
    this.business_number = business_number;
    this.total_amount = total_amount;
    this.type = type;
  }
}