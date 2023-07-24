import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { TokenProvider } from 'src/modules/booster/token.provider';
import { CrefiaCardProvider } from 'src/modules/user/crefia/crefia.card.provider';
import { UserProvider } from 'src/modules/user/user.provider';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...CrefiaCardProvider.models,
      ...TokenProvider.models
    ]),
  ],
  controllers: [SalesController],
  providers: [
    SalesService,
    CrefiaCardProvider,
    UserProvider,
    TokenProvider
  ]
})
export class SalesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(SalesController)
  }
}
