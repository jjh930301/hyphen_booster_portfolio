export class CreateAlertVO {
  title : string;
  body : string;
  event : string;
  event_type : number;
  is_public : boolean;
  is_open : boolean;

  constructor(
    title : string,
    body : string,
    event : string,
    event_type : number,
    is_public : boolean,
    is_open : boolean
  ){
    this.title = title;
    this.body = body;
    this.event = event;
    this.event_type = event_type;
    this.is_public = is_public;
    this.is_open = is_open;
  }
}