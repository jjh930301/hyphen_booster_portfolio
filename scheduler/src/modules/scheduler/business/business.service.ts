import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CronTime } from "src/constants/cron";
import { UserProvider } from "src/modules/user/user.provider";

@Injectable()
export class BusinessService {
  private readonly logger = new Logger('Business service');

  constructor(
    private readonly userPvd : UserProvider
  ) {}

  // @Cron(CronExpression.EVERY_5_MINUTES , {
  //   timeZone : 'Asia/Seoul'  
  // })
  @Cron(CronTime.business , {
    name : 'changed_login',
    timeZone : 'Asia/Seoul'
  })
  async changedLogin() {
    await this.userPvd.changedLogin()
  }
}