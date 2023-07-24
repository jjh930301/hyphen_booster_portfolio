import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booster } from './constants/database';
import { CrefiaUnPurchase } from './entities/booster/crefia/crefia.unpurchase.entity';
import { HealthController } from './health.check.controller';
import { BankModule } from './modules/bank/bank.module';
import { UserModule } from './modules/user/user.module';
import { UserProvider } from './modules/user/user.provider';
import { CrefiaModule } from './modules/crefia/crefia.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(Booster),
    TypeOrmModule.forFeature([
      ...UserProvider.models,
    ]),
    TerminusModule,
    RouterModule.register([
      {
        path : 'user',
        module : UserModule,
        children : [
          {
            path : 'bank',
            module : BankModule
          },
          {
            path : 'crefia',
            module : CrefiaModule
          }
        ]
      }
    ]),
    UserModule,
    CrefiaModule,
    BankModule,
  ],
  controllers: [
    HealthController
  ],
  providers: [],
})
export class AppModule {}
