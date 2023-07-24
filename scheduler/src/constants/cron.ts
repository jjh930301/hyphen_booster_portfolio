import { CronExpression } from "@nestjs/schedule";
import { Constants } from "./constants";

export class CronTime {
  static flag : boolean = Constants.ENV === 'production';
  static SERVICE : boolean = process.env?.SERVICE === 'booster';
  static business = '0 2 22 * * *';
  static baemin = this.SERVICE ? '0 0 5,10,14 * * *' : '0 30 6,7,8,9 * * *';
  static yogiyo = this.SERVICE ? '0 10 5,10,14 * * *' : '0 30 6,7,8,9 * * *';
  static coupangeats = this.SERVICE ? '0 20 5,10,14 * * *' : '0 30 6,7,8,9 * * *';
  static crefia = this.SERVICE ? '0 30 5,10,14 * * *' : '0 30 5,8,10,14,16,20 * * *';
  static crefia_comm = this.SERVICE ? '0 0 9,11 * * *' : '0 30 9,11 * * *';
  static hometax = this.SERVICE ? '0 40 5,10,14 * * *' : '0 30 6,9,10,15,18,21 * * *';
  static hometax_cert = this.SERVICE ? '0 40 5,10,14 * * *' : '0 30 6,9,10,15,18,21 * * *';
  static token = this.SERVICE ? '0 0 4 * * *' : '0 0 3 * * *';
  static daily_report = '0 0 10 * * *';
  static monthly_report = "0 0 14 1 * *";
  static none_account = "0 0 14 * * 1";
  static daily_kakao_alert = "0 0 14 * * *"
  static monthly_kakao_alert= "0 0 18 1 * *";
  static bank = "0 0 8 * * *";
  static expired_cert = "0 0 1 * * *";
  static test = CronExpression.EVERY_30_SECONDS
}