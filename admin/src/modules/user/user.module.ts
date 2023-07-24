import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { AdminProvider } from '../admin/admin.provider';
import { CrefiaCardProvider } from './crefia/crefia.card.provider';
import { CrefiaDepositProvider } from './crefia/crefia.deposit.provider';
import { CrefiaPurchaseProvider } from './crefia/crefia.purchase.provider';
import { CrefiaService } from './crefia/crefia.service';
import { CrefiaUnPurchaseProvider } from './crefia/crefia.unpurchase.provider';
import { BaeminService } from './delivery/baemin.service';
import { DeliveryDepositProvider } from './delivery/delivery.deposit.provider';
import { DeliveryProvider } from './delivery/delivery.provider';
import { HometaxCashPurchaseProvider } from './hometax/hometax.cash.purchase.provider';
import { HometaxCashSalesProvider } from './hometax/hometax.cash.sales.provider';
import { HometaxService } from './hometax/hometax.service';
import { HometaxTaxProvider } from './hometax/hometax.tax.provider';
import { UserBusinessProvider } from './user.business.provider';
import { UserController } from './user.controller';
import { UserProvider } from './user.provider';
import { UserService } from './user.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...AdminProvider.models
    ])
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserProvider,
    UserBusinessProvider,
    CrefiaService,
    CrefiaCardProvider,
    CrefiaDepositProvider,
    CrefiaUnPurchaseProvider,
    CrefiaPurchaseProvider,
    HometaxService,
    HometaxTaxProvider,
    HometaxCashSalesProvider,
    HometaxCashPurchaseProvider,
    BaeminService,
    DeliveryProvider,
    DeliveryDepositProvider,
    AdminProvider
  ]
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Authenticator).forRoutes(UserController)
  }
}
