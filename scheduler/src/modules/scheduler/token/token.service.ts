import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Constants } from "src/constants/constants";
import { CronTime } from "src/constants/cron";
import { TokenProvider } from "src/modules/booster/token.provider";
import { datetimeNow } from "src/utils/date";
import { hyphenTokenRefresh } from "src/utils/hyphen.token.refresh";

@Injectable()
export class TokenService {
  private readonly logger = new Logger('Token scheduler')
  constructor(
    private readonly tokenPvd : TokenProvider
  ){}

  // 매일 새벽 네시
  // @Cron(CronExpression.EVERY_5_MINUTES)
  @Cron(CronTime.token , {
    name : 'upsert token',
    timeZone : 'Asia/Seoul'
  })
  async updateToken() {
    try {
      if(Constants.ENV === 'production') {
        this.logger.log('hyphen data market token refresh' , datetimeNow());
      }
    } catch(e) {
      console.log(e);
    }
  }
}