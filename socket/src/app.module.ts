import { CacheModule, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booster } from './constants/database';
import { HealthController } from './health.check.controller';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { SalesModule } from './modules/sales/sales.module';
import * as redisStore from 'cache-manager-redis-store';
import { Constants } from './constants/constants';
import { RedisClusterModule } from 'nestjs-redis-cluster';
import { nodes } from './constants/redis.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(Booster),
    Constants.ENV === 'production' ? 
    RedisClusterModule.register({
      nodes : nodes
    }) :
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host : process.env.ENV !== 'production' ? 'redis' : process.env.REDIS_HOST,
      port: 6379,
      ttl : 0,
    }),
    CacheModule.register(),
    SalesModule,
    RealtimeModule,
    TerminusModule
  ],
  controllers: [
    HealthController
  ],
  providers: [],
})
export class AppModule {}
