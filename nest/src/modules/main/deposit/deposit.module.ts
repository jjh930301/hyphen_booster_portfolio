import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { TokenProvider } from 'src/modules/booster/token.provider';
import { CrefiaDepositProvider } from 'src/modules/user/crefia/crefia.deposit.provider';
import { CrefiaPurchaseProvider } from 'src/modules/user/crefia/crefia.purchase.provider';
import { UserProvider } from 'src/modules/user/user.provider';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...CrefiaDepositProvider.models,
      ...TokenProvider.models
    ]),
  ],
  controllers: [DepositController],
  providers: [
    DepositService,
    CrefiaDepositProvider,
    UserProvider,
    TokenProvider
  ]
})
export class DepositModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(DepositController)
  }
}
