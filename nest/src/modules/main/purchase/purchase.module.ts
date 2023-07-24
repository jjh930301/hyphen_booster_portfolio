import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { TokenProvider } from 'src/modules/booster/token.provider';
import { CrefiaPurchaseProvider } from 'src/modules/user/crefia/crefia.purchase.provider';
import { UserProvider } from 'src/modules/user/user.provider';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...CrefiaPurchaseProvider.models,
      ...TokenProvider.models
    ]),
  ],
  controllers: [PurchaseController],
  providers: [
    PurchaseService,
    CrefiaPurchaseProvider,
    UserProvider,
    TokenProvider
  ]
})
export class PurchaseModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(PurchaseController)
  }
}
