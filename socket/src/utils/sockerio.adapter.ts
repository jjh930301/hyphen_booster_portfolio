
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Cluster } from 'ioredis';
import { nodes } from 'src/constants/redis.config';
import { createAdapter } from '@socket.io/redis-adapter';
import { Constants } from 'src/constants/constants';

export class SocketIoAdapter extends IoAdapter {

  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis() {
    const pubClient = new Cluster(nodes , {
      dnsLookup: (address, callback) => callback(null, address),
      enableReadyCheck: false
    })
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }
  
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    return server;
  }
}