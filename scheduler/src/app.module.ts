import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booster } from './constants/database';
import { HealthController } from './health.check.controller';
import { BaeminModule } from './modules/scheduler/baemin/baemin.module';
import { BankModule } from './modules/scheduler/bank/bank.module';
import { BusinessModule } from './modules/scheduler/business/business.module';
import { CertModule } from './modules/scheduler/cert/cert.module';
import { CoupangeatsModule } from './modules/scheduler/coupangeats/coupangeats.module';
import { CrefiaModule } from './modules/scheduler/crefia/crefia.module';
import { HometaxModule } from './modules/scheduler/hometax/hometax.modules';
import { ReportModule } from './modules/scheduler/report/report.module';
import { TokenModule } from './modules/scheduler/token/token.module';
import { YogiyoModule } from './modules/scheduler/yogiyo/yogiyo.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(Booster),
    CrefiaModule,
    HometaxModule,
    TokenModule,
    BaeminModule,
    BusinessModule,
    ReportModule,
    BankModule,
    YogiyoModule,
    CoupangeatsModule,
    TerminusModule,
    CertModule,
  ],
  controllers: [
    HealthController
  ],
  providers: [],
})
export class AppModule {}
