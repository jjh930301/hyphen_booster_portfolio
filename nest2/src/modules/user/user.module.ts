import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { DeliveryProvider } from '../delivery/delivery.provider';
import { DeliveryDepositProvider } from '../delivery/delivery.deposit.provider'
import { HometaxCashProvider } from '../hometax/hometax.cash.provider';
import { HometaxPurchaseProvider } from '../hometax/hometax.purchase.provider';
import { HometaxTaxProvider } from '../hometax/hometax.tax.provider';
import { DeliveryController } from '../delivery/delivery.controller';
import { YogiyoService } from '../delivery/yogiyo.service';
import { UserController } from './user.controller';
import { UserProvider } from './user.provider';
import { UserService } from './user.service';
import { AlertProvider } from '../alert/alert.provider';
import { CoupangService } from '../delivery/coupang.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
    ]),
    
  ],
  controllers : [
    UserController,
    DeliveryController
  ],
  providers: [
    UserService,
    UserProvider,
    HometaxTaxProvider,
    HometaxCashProvider,
    HometaxPurchaseProvider,
    YogiyoService,
    CoupangService,
    DeliveryProvider,
    DeliveryDepositProvider,
    AlertProvider
  ],
})
export class UserModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Authenticator).forRoutes(DeliveryController,UserController)
  }
}
