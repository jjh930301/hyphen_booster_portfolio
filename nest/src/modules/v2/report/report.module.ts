import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { StatisticsService } from 'src/modules/statistics/statistics.service';
import { AlertProvider } from 'src/modules/user/alert/alert.provider';
import { CrefiaCardProvider } from 'src/modules/user/crefia/crefia.card.provider';
import { CrefiaDepositProvider } from 'src/modules/user/crefia/crefia.deposit.provider';
import { CrefiaPurchaseProvider } from 'src/modules/user/crefia/crefia.purchase.provider';
import { DeliveryDepositProvider } from 'src/modules/user/delivery/delivery.deposit.provider';
import { DeliveryProvider } from 'src/modules/user/delivery/delivery.provider';
import { HometaxCashSalesProvider } from 'src/modules/user/hometax/hometax.cash.sales.provider';
import { HometaxTaxProvider } from 'src/modules/user/hometax/hometax.tax.provider';
import { ReportProvider } from 'src/modules/user/report/report.provider';
import { UserProvider } from 'src/modules/user/user.provider';
import { Report2Controller } from './report.controller';
import { Report2Service } from './report.service';
import { BusinessReport } from 'src/entities/booster/user/report.entity'

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...DeliveryProvider.models,
      ...CrefiaPurchaseProvider.models,
      ...CrefiaCardProvider.models,
      ...CrefiaDepositProvider.models,
      ...HometaxCashSalesProvider.models,
      ...HometaxTaxProvider.models,
      ...DeliveryDepositProvider.models,
    ])
  ],
  controllers: [Report2Controller],
  providers: [
    Report2Service,
    StatisticsService,
    ReportProvider,
    UserProvider,
    UserProvider,
    DeliveryProvider,
    CrefiaPurchaseProvider,
    CrefiaCardProvider,
    CrefiaDepositProvider,
    HometaxCashSalesProvider,
    HometaxTaxProvider,
    DeliveryDepositProvider,
    AlertProvider,
    ReportProvider
  ]
})
export class Report2Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(Report2Controller)
  }
}