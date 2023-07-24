import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { TokenProvider } from 'src/modules/booster/token.provider';
import { CrefiaCardProvider } from 'src/modules/user/crefia/crefia.card.provider';
import { CrefiaPurchaseProvider } from 'src/modules/user/crefia/crefia.purchase.provider';
import { CrefiaUnPurchaseProvider } from 'src/modules/user/crefia/crefia.unpurchase.provider';
import { UserProvider } from 'src/modules/user/user.provider';
import { UnpurchaseController } from './unpurchase.controller';
import { UnpurchaseService } from './unpurchase.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...TokenProvider.models,
      ...CrefiaUnPurchaseProvider.models
    ])
  ],
  controllers: [UnpurchaseController],
  providers: [
    UnpurchaseService,
    UserProvider,
    TokenProvider,
    CrefiaUnPurchaseProvider
  ]
})
export class UnpurchaseModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(UnpurchaseController)
  }
}
