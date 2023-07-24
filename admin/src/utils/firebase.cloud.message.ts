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

  static notification(
    title : string,
    msg : string,
    type : string | null = '1',
    token : string
  ) {
    const message : admin.messaging.Message = {
      notification : {
        title : title,
        body : msg
      },
      data : {
        booster : JSON.stringify({
          event_type : type,
          event : null,
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
          console.log("ok:::",res)
          return res
        })
        .catch((err) => {
          console.log("error:::" , err)
          return err
        })
    } catch(e) {
      return null;
    }
  }
}