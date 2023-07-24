import * as admin from 'firebase-admin';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';

export class FirebaseCloudMessage {
  private message : Array<admin.messaging.Message> | admin.messaging.Message;

  constructor(
    message : Array<admin.messaging.Message> | admin.messaging.Message,
  ) {
    this.message = message;
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
          event_type : type,
          event : 'asfdjkbvanldf',
          is_read : false,
          title : 'test',
          body : 'message'
        })
      },
      token : 'diZu56VHiUEglAILNvhMdJ:APA91bE3Bq3tLxyej1ABtgcSWlPnFU6pHnRx5urr_fOKHzgH_z-3n6Psg9rAZvdIhSOdVHvV1s4E1zAEe6WIvhgZhEl_-4rr8c8Sjyu_I2cPTfeeRe9OZBObot3l5QryppyToein81cN'
    }
    return new FirebaseCloudMessage(message).send();
  }

  static changedPassword(
    title : string,
    body : string,
    event : string,
    type : string,
    token : string,
  ) : Promise<admin.messaging.MessagingPayload> {
    const message : admin.messaging.Message = {
      notification : {
        title : title,
        body : body
      },
      data : {
        booster : JSON.stringify({
          event_type : type,
          event : event,
          is_read : false,
          title : title,
          body : body
        })
      },
      token : token
    }
    return new FirebaseCloudMessage(message).send();
  }

  /**
   * @param title fcm 제목
   * @param msg fcm 메세지
   * @param event ???
   * @param token fcm token
   */
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