import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booster } from './constants/database';
import { HealthController } from './health.check.controller';
import { BankModule } from './modules/bank/bank.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(Booster),
    RouterModule.register([
      {
        path : 'user',
        module : UserModule
      },
      {
        path : 'bank',
        module : BankModule
      },
    ]),
    UserModule,
    BankModule,
    TerminusModule
  ],
  controllers: [
    HealthController
  ],
  providers: [],
})
export class AppModule {}
