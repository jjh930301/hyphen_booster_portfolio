import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { CrefiaCardProvider } from 'src/modules/user/crefia/crefia.card.provider';
import { CrefiaDepositProvider } from 'src/modules/user/crefia/crefia.deposit.provider';
import { CrefiaPurchaseProvider } from 'src/modules/user/crefia/crefia.purchase.provider';
import { DeliveryDepositProvider } from 'src/modules/user/delivery/delivery.deposit.provider';
import { DeliveryProvider } from 'src/modules/user/delivery/delivery.provider';
import { HometaxCashSalesProvider } from 'src/modules/user/hometax/hometax.cash.sales.provider';
import { HometaxTaxProvider } from 'src/modules/user/hometax/hometax.tax.provider';
import { UserProvider } from 'src/modules/user/user.provider';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...CrefiaCardProvider.models,
      ...CrefiaPurchaseProvider.models,
      ...CrefiaDepositProvider.models,
      ...HometaxCashSalesProvider.models,
      ...HometaxTaxProvider.models,
      ...DeliveryProvider.models,
      ...DeliveryDepositProvider.models,
    ])
  ],
  controllers: [CalendarController],
  providers: [
    CalendarService,
    UserProvider,
    CrefiaCardProvider,
    CrefiaPurchaseProvider,
    CrefiaDepositProvider,
    HometaxCashSalesProvider,
    HometaxTaxProvider,
    DeliveryProvider,
    DeliveryDepositProvider,
  ]
})
export class CalendarModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(CalendarController)
  }
}
