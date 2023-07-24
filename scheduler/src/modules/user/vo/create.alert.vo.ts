export class CreateAlertVO {
  title : string;
  body : string;
  event : string;
  event_type : number;
  is_public : boolean | null = false;

  constructor(
    title : string,
    body : string,
    event : string,
    event_type : number,
    is_public : boolean | null = false
  ){
    this.title = title;
    this.body = body;
    this.event = event;
    this.event_type = event_type;
    this.is_public = is_public;
  }
}