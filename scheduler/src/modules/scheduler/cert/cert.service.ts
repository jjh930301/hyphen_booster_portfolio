import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Constants } from "src/constants/constants";
import { CronTime } from "src/constants/cron";
import { FcmType } from "src/constants/fcm.type";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { UserCert } from "src/entities/booster/user/user.cert.entity";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { CreateAlertVO } from "src/modules/user/vo/create.alert.vo";
import { FirebaseCloudMessage } from "src/utils/firebase.cloud.message";
import { CertProvider } from "./cert.provider";

@Injectable()
export class CertService {
  constructor(
    private readonly certPvd : CertProvider,
    private readonly userPvd : UserProvider,
    private readonly alertPvd : AlertProvider
  ) {}

  @Cron(CronTime.expired_cert , {
    name : 'expired_cert',
    timeZone : 'Asia/Seoul'  
  })
  public async removeExpiredCert() {
    if(Constants.RUNNABLE) {
      const now = new Date(new Date().setHours(new Date().getHours() + 9)).toISOString().split('T');
      const certs = await this.certPvd.findExpiredCert(now[0]);
      
      certs.forEach(cert => {
        this.removeCert(cert)
      })
    }
  }

  private async removeCert(cert : UserCert) {
    const businesses = await this.userPvd.findByCertNum(cert.cert_number);
    if(businesses) {
      await this.certPvd.removeCert(cert.cert_number);
      businesses.forEach(async business => {
        this.removeUserCert(String(business.user) , business.cert_number);
      })
    }  else {
      const user = await this.userPvd.joinById(String(cert.user));
      const titleBody = FcmType.MESSAGE_TYPE[FcmType.EXPIRED_CERT]
      const alertVO = new CreateAlertVO(
        titleBody.title,
        titleBody.body,
        String(cert.business),
        Number(FcmType.EXPIRED_CERT),
      )
      await this.alertPvd.createAlert(cert.business , alertVO);
      user.devices.forEach(device => {
        if(device.token) {
          FirebaseCloudMessage.report(
            titleBody.title,
            titleBody.body,
            FcmType.EXPIRED_CERT,
            String(cert.business),
            device.token
          )
        }
      })
    }
    
  }
  private async removeUserCert(userId : string , certNum : string) {
    const user = await this.userPvd.joinById(userId);
    const expiredBusiness : Array<UserBusiness> = [];
    user.businesses.forEach(business => {
      if(business.cert_number === certNum) {
        expiredBusiness.push(business);
        this.userPvd.changedBusiness(business , {
          cert : null,
          pri : null,
          cert_password : null,
          cert_number : null,
          cert_issuer : null,
          cert_expiration : null
        })
      }
    });
    if(expiredBusiness.length !== 0) {
      const titleBody = FcmType.MESSAGE_TYPE[FcmType.EXPIRED_CERT]
      expiredBusiness.forEach(async business => {
        const alertVO = new CreateAlertVO(
          titleBody.title,
          titleBody.body,
          business.id,
          Number(FcmType.EXPIRED_CERT),
        )
        await this.alertPvd.createAlert(business , alertVO);
      })
      user.devices.forEach(device => {
        if(device.token) {
          FirebaseCloudMessage.report(
            titleBody.title,
            titleBody.body,
            FcmType.EXPIRED_CERT,
            expiredBusiness[0].id,
            device.token
          )
        }
      })
    }
  }
}