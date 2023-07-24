import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { UserController } from './user.controller';
import { UserProvider } from './user.provider';
import { UserService } from './user.service';
import { CrefiaCardProvider } from './crefia/crefia.card.provider';
import { TokenProvider } from '../booster/token.provider';
import { CrefiaPurchaseProvider } from './crefia/crefia.purchase.provider';
import { CrefiaDepositProvider } from './crefia/crefia.deposit.provider';
import { CrefiaService } from './crefia/crefia.service';
import { HometaxService } from './hometax/hometax.service';
import { HometaxCashPurchaseProvider } from './hometax/hometax.cash.purchase.provider';
import { HometaxCashSalesProvider } from './hometax/hometax.cash.sales.provider';
import { HometaxTaxProvider } from './hometax/hometax.tax.provider';
import { CrefiaUnPurchaseProvider } from './crefia/crefia.unpurchase.provider';
import { DeliveryProvider } from './delivery/delivery.provider';
import { DeliveryService } from '../main/delivery/delivery.service';
import { BaeminService } from './delivery/baemin.service';
import { AlertProvider } from './alert/alert.provider';
import { DeliveryDepositProvider } from './delivery/delivery.deposit.provider';
import { WithdrawFeedbackProvider } from '../feedback/withdraw.feedback.provider';
import { AlertModule } from './alert/alert.module';
import { ReportModule } from './report/report.module';
import { CrefiaFeeProvider } from './crefia/crefia.fee.provider';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...CrefiaCardProvider.models,
      ...CrefiaPurchaseProvider.models,
      ...CrefiaDepositProvider.models,
      ...CrefiaUnPurchaseProvider.models,
      ...TokenProvider.models,
      ...HometaxCashPurchaseProvider.models,
      ...HometaxCashSalesProvider.models,
      ...HometaxTaxProvider.models,
      ...DeliveryProvider.models,
      ...DeliveryDepositProvider.models,
      ...WithdrawFeedbackProvider.models,
    ]),
    AlertModule,
    ReportModule,
  ],
  controllers : [UserController],
  providers: [
    UserService,
    CrefiaService,
    HometaxService,
    DeliveryService,
    BaeminService,
    UserProvider,
    AlertProvider,
    CrefiaCardProvider,
    CrefiaPurchaseProvider,
    CrefiaDepositProvider,
    CrefiaUnPurchaseProvider,
    CrefiaFeeProvider,
    AlertProvider,
    TokenProvider,
    HometaxCashPurchaseProvider,
    HometaxCashSalesProvider,
    HometaxTaxProvider,
    DeliveryProvider,
    DeliveryDepositProvider,
    WithdrawFeedbackProvider
  ]
})
export class UserModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(UserController)
  }
}
