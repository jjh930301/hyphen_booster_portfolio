import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { CrefiaCardProvider } from '../user/crefia/crefia.card.provider';
import { DeliveryProvider } from '../user/delivery/delivery.provider';
import { HometaxCashSalesProvider } from '../user/hometax/hometax.cash.sales.provider';
import { HometaxTaxProvider } from '../user/hometax/hometax.tax.provider';
import { UserProvider } from '../user/user.provider';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...CrefiaCardProvider.models,
      ...HometaxCashSalesProvider.models,
      ...HometaxTaxProvider.models,
      ...DeliveryProvider.models,

    ])
  ],
  controllers: [
    StatisticsController
  ],
  providers: [
    StatisticsService,
    UserProvider,
    CrefiaCardProvider,
    HometaxCashSalesProvider,
    HometaxTaxProvider,
    DeliveryProvider
  ]
})
export class StatisticsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(StatisticsController)
  }
}
