import * as admin from 'firebase-admin';
import { FcmType } from 'src/constants/fcm.type';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';

export class FirebaseCloudMessage {
  private message : Array<admin.messaging.Message> | admin.messaging.Message;

  constructor(
    message : Array<admin.messaging.Message> | admin.messaging.Message,
  ) {
    this.message = message;
  }

  static report(
    title : string,
    msg : string,
    type : string,
    event : Object,
    token : string,
  ) : Promise<admin.messaging.MessagingPayload> {
    const message : admin.messaging.Message = {
      notification : {
        title : title,
        body : msg
      },
      data : {
        booster : JSON.stringify({
          event_type : type,
          event : event,
          is_read : false,
          title : title,
          body : msg
        })
      },
      token : token
    }
    return new FirebaseCloudMessage(message).send();
  }

  static testFcm(
    type : string,
  ): Promise<admin.messaging.MessagingPayload> {
    const message : admin.messaging.Message = {
      notification : {
        title : 'test',
        body : 'bodyasdlkfnasdlkandlscs'
      },
      data : {
        booster : JSON.stringify({
          event_type : 11,
          event : `{"record":"R","appr_yn":"Y","biz_no":"3234900902","card_no":"47889200xxxx198x","validity":"0000","installment":"00","appr_amount":8500,"service_charge":0,"appr_no":"02559070","appr_date":"2022-11-22","appr_time":"13:16:17","cancel_date":null,"cancel_time":null,"member_no":"0128560745","bscis_code":"05","bscpr_code":"05","termid":"AT0348500A","data_record":"C","access":true}`,
          is_read : false,
          title : '카드승인',
          body : '(승인번호) 02559070 / 신한카드 47889200xxxx198x 8,500 2022-11-22 13:16:17'
        })
      },
      token : 'dJzPIGYvJEvnm7Qwt8voa2:APA91bFtqcSGUatrRe1vHJkqbyO5nO6rTR3dcYYx9WHLP5Ia_BlOp7H2223KKSeIptOQo-pLWXiLuFxYgdJFXR7fooTIFR_s6UdEfcKIlyXh4V0RTj287-9bT7NZvti86zsBPAleF1V2'
    }
    return new FirebaseCloudMessage(message).send();
  }

  /**
   * @param title fcm 제목
   * @param msg fcm 메세지
   * @param businessId 완료된 business uuid
   * @param token fcm token
   */
  static registAccount(
    title : string,
    msg : string,
    type : string,
    business : UserBusiness,
    token : string,
  ) : Promise<admin.messaging.MessagingPayload> {
    const message : admin.messaging.Message = {
      notification : {
        title : title,
        body : msg
      },
      data : {
        booster : JSON.stringify({
          event_type : type,
          event : business.id,
          is_read : false,
          title : title,
          body : msg
        })
      },
      token : token
    }
    return new FirebaseCloudMessage(message).send();
  }

  async send() : Promise<admin.messaging.MessagingPayload> {
    try {
      const type = Array.isArray(this.message);
      if(type === false && this.message["token"] === null) {
        return;
      }
      if(Array.isArray(this.message)) {
        this.message.filter((msg) => {
          if(
            msg["token"] !== null || 
            msg["token"] !== "" || 
            msg["token"] !== undefined
          ) {
            return msg
          }
        })
      }
      const msg = type
        ? admin.messaging().sendAll(this.message as Array<admin.messaging.Message>)
        : admin.messaging().send(this.message as admin.messaging.Message)
      return await msg
        .then((res) => {
          return res
        })
        .catch((err) => {
          return err
        })
    } catch(e) {
      return null;
    }
  }
}