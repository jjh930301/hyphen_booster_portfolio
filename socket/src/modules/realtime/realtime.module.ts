import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertProvider } from '../alert/alert.provider';
import { UserProvider } from '../user/user.provider';
import { RealtimeGateway } from './realtime.gateway';
import * as redisStore from 'cache-manager-redis-store';
import { Constants } from 'src/constants/constants';
import { RedisClusterModule } from 'nestjs-redis-cluster';
import { nodes } from 'src/constants/redis.config';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...AlertProvider.models
    ]),
    CacheModule.register()
  ],
  providers: [
    RealtimeGateway,
    UserProvider,
    AlertProvider
  ],
})
export class RealtimeModule {}