import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrefiaCardProvider } from '../user/crefia/crefia.card.provider';
import { CrefiaPurchaseProvider } from '../user/crefia/crefia.purchase.provider';
import { CrefiaDepositProvider } from '../user/crefia/crefia.deposit.provider';
import { CrefiaUnPurchaseProvider } from '../user/crefia/crefia.unpurchase.provider';
import { CrefiaService } from '../user/crefia/crefia.service';
import { UserProvider } from '../user/user.provider';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AlertProvider } from '../user/alert/alert.provider';
import { TokenProvider } from '../booster/token.provider';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models , 
      ...CrefiaCardProvider.models,
      ...CrefiaPurchaseProvider.models,
      ...CrefiaUnPurchaseProvider.models,
      ...CrefiaDepositProvider.models,
      ...TokenProvider.models
    ]),
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CrefiaService,
    UserProvider,
    CrefiaCardProvider,
    CrefiaPurchaseProvider,
    CrefiaUnPurchaseProvider,
    CrefiaDepositProvider,
    AlertProvider,
    TokenProvider
  ]
})
export class AuthModule {}
