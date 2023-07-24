import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertProvider } from '../alert/alert.provider';
import { BankProvider } from '../bank/bank.provider';
import { CrefiaCardProvider } from '../crefia/crefia.card.provider';
import { CrefiaDepositProvider } from '../crefia/crefia.deposit.provider';
import { CrefiaPurchaseProvider } from '../crefia/crefia.purchase,provider';
import { CrefiaService } from '../crefia/crefia.service';
import { CrefiaUnPurchaseProvider } from '../crefia/crefia.unpurchase.provider';
import { BaeminService } from '../delivery/baemin.service';
import { DeliveryDepositProvider } from '../delivery/delivery.deposit.provider';
import { DeliveryProvider } from '../delivery/delivery.provider';
import { YogiyoService } from '../delivery/yogiyo.service';
import { UserController } from './user.controller';
import { UserProvider } from './user.provider';
import { UserService } from './user.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models
    ])
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserProvider,
    BankProvider,
    YogiyoService,
    DeliveryProvider,
    DeliveryDepositProvider,
    AlertProvider,
    BaeminService,
    CrefiaCardProvider,
    CrefiaPurchaseProvider,
    CrefiaDepositProvider,
    CrefiaUnPurchaseProvider,
    CrefiaService
  ]
})
export class UserModule {}
