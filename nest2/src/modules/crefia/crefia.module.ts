import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { UserProvider } from '../user/user.provider';
import { CrefiaController } from './crefia.controller';
import { CrefiaFeeProvider } from './crefia.fee.provider';
import { CrefiaService } from './crefia.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
    ])
  ],
  controllers: [
    CrefiaController
  ],
  providers: [
    CrefiaService,
    UserProvider,
    CrefiaFeeProvider
  ]
})
export class CrefiaModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Authenticator).forRoutes(CrefiaController)
  }
}