import { CACHE_MANAGER, Inject, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Namespace, Socket } from 'socket.io';
import { JwtHelper } from 'src/helpers/jwt.helper';
import { SelectHelper } from 'src/helpers/select/select.helper';
import { UserGuard } from 'src/middlewares/user.guard';
import { RealtimeVO } from '../sales/vo/realtime.vo';
import { UserProvider } from '../user/user.provider';

@WebSocketGateway({
  cors : {
    origin : '*'
  },
  transports : ['websocket'],
  namespace : 'realtime'
})
export class RealtimeGateway{
  @WebSocketServer()
  server : Namespace;

  private TTL : number = 60 * 60 * 24;

  constructor(
    private readonly userPvd : UserProvider,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager : Cache,
  ){}
  
  @UseGuards(UserGuard)
  @SubscribeMessage('main')
  async connectUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data
  ) {
    try {
      // guard에서 받아온 id로 유저 Select
      const socketID = socket.id
      const user = await this.userPvd.joinBusiness(data.id , SelectHelper.business_select);
      if(!user) {
        socket.disconnect();
      }
      if(data.business_number && data.device_id) {
        await this.cacheManager.set(
          `${data.business_number}:${data.device_id}` , 
          `${String(socketID).replace(/"|'/g , '')}` , 
          this.TTL
        );
      }
      
    } catch(e) {
      console.log(e);
    }
  }
  @UseGuards(UserGuard)
  @SubscribeMessage('delete')
  async handleDisconnect(
    @MessageBody() data,
  ) {
    try {
      if(data.id) {
        await this.cacheManager.del(`${data.business_number}:${data.device_id}`);
      }
    } catch(e) {
      console.log(e);
    }
  }
}
