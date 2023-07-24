import { CACHE_MANAGER, Inject, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Cache } from "cache-manager";
import { Namespace, Server, Socket } from "socket.io";
import { Constants } from "src/constants/constants";
import { FcmType } from "src/constants/fcm.type";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CardApprBatch } from "src/entities/interpos/cardappr.batch.entity";
import { CashBatch } from "src/entities/interpos/cash.batch.entity";
import { KstaCardCompany } from "src/enums/card.code";
import { SelectHelper } from "src/helpers/select/select.helper";
import { AuthGuard } from "src/middlewares/auth.guard";
import { UserGuard } from "src/middlewares/user.guard";
import { parseKoreaDate } from "src/utils/date";
import { FirebaseCloudMessage } from "src/utils/firebase.cloud.message";
import { moneyMasking } from "src/utils/masking";
import { AlertProvider } from "../alert/alert.provider";
import { CreateAlertVO } from "../alert/vo/create.alert.vo";
import { UserProvider } from "../user/user.provider";
import { RealtimeVO } from "./vo/realtime.vo";

@WebSocketGateway({
  cors : {
    origin : '*'
  },
  transports : ['websocket'],
})
export class SalesGateway{
  @WebSocketServer()
  namespace : Namespace;

  @WebSocketServer()
  server : Server;

  private CARD_APPR : number = 0;
  private CARD_CANCEL : number = 1;
  private CASH_APPR : number = 2;
  private CASH_CANCEL : number = 3;

  constructor(
    private readonly userPvd : UserProvider,
    private readonly alertPvd : AlertProvider,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager : Cache,
  ){}
  @UseGuards(AuthGuard)
  @SubscribeMessage('card')
  async cardSales(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: CardApprBatch,
  ) {
    if(!data['access']) {
      // socket.disconnect();
      return
    }
    if(Constants.RUNNABLE) {
      try {
        // 실시간만 받아옴
        if(data['record'] !== 'R') {
          return;
        }
        //UserBusiness json
        const biz : UserBusiness = await this.userPvd.findByBizNo(data['biz_no']) as UserBusiness;
        
        if(!biz) {
          return;
        }
        console.log(`${biz['store_name']}`)
        const user = await this.userPvd.joinById(biz['user_id'] , SelectHelper.user_select);
        if(!user) {
          return;
        }
        //UserBusiness Object
        const date = data.appr_yn === 'Y' ? data.appr_date : data.cancel_date
        const time = data.appr_yn === 'Y' ? data.appr_time : data.cancel_time
        const business : UserBusiness = user.findBusinessNum(biz.business_number);
        
        await this.alertPvd.createAlert(
          business , 
          new CreateAlertVO(
          data.appr_yn === 'Y' ? '카드승인' : '카드 승인취소', // title
          `(승인번호) ${data.appr_no} / ${KstaCardCompany[data.bscpr_code]['name']} ${data.card_no} | ${biz['store_name']}
${moneyMasking(data.appr_amount)}
${parseKoreaDate(date)} ${time}`, // body
          JSON.stringify(data), // event
          Number(FcmType.CARD_APPROVAL), // event_type
          false, 
        ))
        const nsp : Namespace = await this.server._nsps.get('/realtime');
        user.devices.forEach(async (device) => {
          // 캐싱된 biz_no를 찾아서 소켓으로 보내줌
          const socketId= nsp.sockets.get(await this.cacheManager.get(`${data.biz_no}:${device.id}`));
          // const socketId= this.namespace.sockets.get(await this.cacheManager.get(`${data.biz_no}:${device.id}`));
          if(socketId) {
            socketId.emit('main' , new RealtimeVO(
              data.biz_no , 
              data.appr_amount , 
              data.appr_yn === 'Y' ? this.CARD_APPR : this.CARD_CANCEL)
            );
          }
          if(device.card_sales_approval_alert == true && data.appr_yn === 'Y') {
            //카드 승인 fcm
            const fcm = FcmType.MESSAGE_TYPE[FcmType.CARD_APPROVAL](data , biz['store_name']);
            FirebaseCloudMessage.approvalAndCancel(
              fcm.title,
              fcm.body,
              FcmType.CARD_APPROVAL,
              data,
              device.token
            )
          }
          if(device.card_sales_cancel_alert == true && data.appr_yn === 'N') {
            //카드 취소 fcm
            const fcm = FcmType.MESSAGE_TYPE[FcmType.CARD_CANCEL_APPROVAL](data , biz['store_name']);
            FirebaseCloudMessage.approvalAndCancel(
              fcm.title,
              fcm.body,
              FcmType.CARD_CANCEL_APPROVAL,
              data,
              device.token
            )
          }
        })
  
      } catch(e) {}
    }
  }

  @UseGuards(AuthGuard)
  @SubscribeMessage('cash')
  async cashSales(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data,
  ) {
    if(!data['access']) {
      // socket.disconnect();
      return
    }
    try {
      // 실시간만 받아옴
      if(data['record'] !== 'R') {
        return;
      }
      const biz : UserBusiness = await this.userPvd.findByBizNo(data['biz_no']) as UserBusiness;
      
      if(!biz) {
        return;
      }
      console.log(`${biz['store_name']}`)
      const user = await this.userPvd.joinById(biz['user_id'] , SelectHelper.user_select);
      if(!user) {
        return;
      }
      const business : UserBusiness = user.findBusinessNum(biz.business_number);

      await this.alertPvd.createAlert(
        business , 
        new CreateAlertVO(
          data.appr_yn === 'Y' ? '현금승인' : '현금 승인취소', // title
        `(승인번호) ${data.appr_no} | ${biz['store_name']}
${moneyMasking(data.total_amount)} 원
${parseKoreaDate(data.appr_date)} ${data.appr_time}`, // body
        JSON.stringify(data), // event
        data.appr_yn === 'Y' ? 
        Number(FcmType.CASH_APPROVAL) : 
        Number(FcmType.CASH_CANCEL_APPROVAL), // event_type
        false, // is_public
      ))
      const nsp : Namespace = await this.server._nsps.get('/realtime');
      user.devices.forEach(async (device) => {
        // 캐싱된 biz_no를 찾아서 소켓으로 보내줌
        const socketId= nsp.sockets.get(await this.cacheManager.get(`${data.biz_no}:${device.id}`));
        // const socketId= this.namespace.sockets.get(await this.cacheManager.get(`${data.biz_no}:${device.id}`));
        if(socketId) {
          socketId.emit('main' , new RealtimeVO(
            data.biz_no , 
            String(data.total_amount) , 
            data.appr_yn === 'Y' ? this.CASH_APPR : this.CASH_CANCEL)
          );
        }
        if(device.cash_sales_approval_alert == true && data.appr_yn === 'Y') {
          //현금 승인 fcm
          const fcm = FcmType.MESSAGE_TYPE[FcmType.CASH_APPROVAL](data,biz['store_name']);
          FirebaseCloudMessage.approvalAndCancel(
            fcm.title,
            fcm.body,
            FcmType.CASH_APPROVAL,
            data,
            device.token
          )
        }
        if(device.cash_sales_cancel_alert == true && data.appr_yn === 'N') {
          //현금 취소 fcm
          const fcm = FcmType.MESSAGE_TYPE[FcmType.CASH_CANCEL_APPROVAL](data,biz['store_name']);
          FirebaseCloudMessage.approvalAndCancel(
            fcm.title,
            fcm.body,
            FcmType.CASH_CANCEL_APPROVAL,
            data,
            device.token
          )
        }
      })
    } catch(e) {}
  }
}