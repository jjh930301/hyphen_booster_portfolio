import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { AlertProvider } from '../alert/alert.provider';
import { CrefiaCardProvider } from '../crefia/crefia.card.provider';
import { CrefiaPurchaseProvider } from '../crefia/crefia.purchase.provider';
import { DeliveryDepositProvider } from '../delivery/delivery.deposit.provider';
import { DeliveryProvider } from '../delivery/delivery.provider';
import { HometaxCashSalesProvider } from '../hometax/hometax.cash.sales.provider';
import { HometaxTaxProvider } from '../hometax/hometax.tax.provider';
import { UserProvider } from '../user.provider';
import { ReportController } from './report.controller';
import { ReportProvider } from './report.provider';
import { ReportService } from './report.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...DeliveryProvider.models,
      ...CrefiaPurchaseProvider.models,
      ...CrefiaCardProvider.models,
      ...HometaxCashSalesProvider.models,
      ...HometaxTaxProvider.models,
      ...DeliveryDepositProvider.models
    ])
  ],
  controllers: [ReportController],
  providers: [
    ReportService,
    ReportProvider,
    UserProvider,
    UserProvider,
    DeliveryProvider,
    CrefiaPurchaseProvider,
    CrefiaCardProvider,
    HometaxCashSalesProvider,
    HometaxTaxProvider,
    DeliveryDepositProvider,
    AlertProvider
  ]
})
export class ReportModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(ReportController)
  }
}
