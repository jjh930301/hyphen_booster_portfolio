import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booster, Interpos } from './constants/database';
import { User } from './entities/booster/user/user.entity';
import { HealthController } from './health.check.controller';
import { SalesModule } from './modules/main/sales/sales.module';
import { DepositModule } from './modules/main/deposit/deposit.module';
import { PurchaseModule } from './modules/main/purchase/purchase.module';
import { NotificationModule } from './modules/notification/notification.module';
import { UserModule } from './modules/user/user.module';
import { CashSalesModule } from './modules/main/cash/sales/cash.sales.module';
import { UnpurchaseModule } from './modules/main/unpurchase/unpurchase.module';
import { TaxModule } from './modules/main/tax/tax.module';
import { DeliveryModule } from './modules/main/delivery/delivery.module';
import { InquiryModule } from './modules/user/inquiry/inquiry.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { CalendarModule } from './modules/main/calendar/calendar.module';
import { VersionModule } from './modules/version/version.module';
import { AlertModule } from './modules/user/alert/alert.module';
import { ReportModule } from './modules/user/report/report.module';
import { AuthModule } from './modules/auth/auth.module';
import { Report2Module } from './modules/v2/report/report.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(Booster),
    TypeOrmModule.forRoot(Interpos),
    TypeOrmModule.forFeature([
      User
    ]),
    RouterModule.register([
      {
        path : 'version',
        module : VersionModule
      },
      {
        path : 'v2',
        children : [
          {
            path : 'report',
            module : Report2Module
          }
        ]
      },
      // {
      //   path : 'auth',
      //   module : AuthModule
      // },
      {
        path : 'user',
        module : UserModule,
        children : [
          {
            path : 'alert',
            module : AlertModule
          },
          {
            path : 'inquiry',
            module : InquiryModule
          },
          {
            path : 'report',
            module : ReportModule
          }
        ]
      },
      {
        path : 'notification',
        module : NotificationModule
      },
      {
        path : 'main',
        children : [
          {
            path : 'calendar',
            module : CalendarModule
          },
          {
            path : 'sales',
            module : SalesModule
          },
          {
            path : 'purchase',
            module : PurchaseModule
          },
          {
            path : 'deposit',
            module : DepositModule
          },
          {
            path : 'cash',
            children : [
              {
                path : 'sales',
                module : CashSalesModule
              }
            ]
          },
          {
            path : 'tax',
            module : TaxModule
          },
          {
            path : 'unpurchase',
            module : UnpurchaseModule
          },
          {
            path : 'delivery',
            module : DeliveryModule
          }
        ]
      },
      {
        path : 'statistics',
        module : StatisticsModule
      },
    ]),
    // WebSocketModule,
    VersionModule,
    Report2Module,
    // AuthModule,
    AlertModule,
    UserModule,
    ReportModule,
    InquiryModule,
    NotificationModule,
    CalendarModule,
    SalesModule,
    PurchaseModule,
    DepositModule,
    CashSalesModule,
    TaxModule,
    UnpurchaseModule,
    DeliveryModule,
    StatisticsModule,
    TerminusModule,
  ],
  controllers: [
    HealthController,
    // SocketController  //socket client test[테스트]
  ],
  providers: [
    // SocketService,  //socket client test[테스트]
  ],
})
export class AppModule {}
