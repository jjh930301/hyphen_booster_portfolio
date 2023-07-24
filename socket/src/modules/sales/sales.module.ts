import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisClusterModule } from 'nestjs-redis-cluster';
import { Constants } from 'src/constants/constants';
import { nodes } from 'src/constants/redis.config';
import { AlertProvider } from '../alert/alert.provider';
import { UserProvider } from '../user/user.provider';
import * as redisStore from 'cache-manager-redis-store';
import { SalesGateway } from './sales.gateway';


@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...AlertProvider.models
    ]),
    CacheModule.register()
  ],
  providers: [
    SalesGateway,
    UserProvider,
    AlertProvider
  ],
})
export class SalesModule {}