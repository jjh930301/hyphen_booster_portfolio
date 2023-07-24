import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.check.controller';
import { Booster, Interpos, BoosterAdmin } from './constants/database';
import { AdminModule } from './modules/admin/admin.module';
import { UserModule } from './modules/user/user.module';
import { AdminUser } from './entities/admin/admin.user.entity';
import { AuthModule } from './modules/auth/auth.module';
import { TerminusModule } from '@nestjs/terminus';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MemberModule } from './modules/member/member.module';
import { NotificationModule } from './modules/notification/notification.module';
import { InquiryModule } from './modules/inquiry/inquiry.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(Booster),
    TypeOrmModule.forRoot(Interpos),
    TypeOrmModule.forRoot(BoosterAdmin),
    TypeOrmModule.forFeature([
      AdminUser
    ]),
    RouterModule.register([
      {
        path : '',
        module : AdminModule,
        children : [
          {
            path : 'auth',
            module : AuthModule
          },
          {
            path : 'notification',
            module : NotificationModule
          },
          {
            path : 'inquiry',
            module : InquiryModule
          },
          {
            path : 'user',
            module : UserModule
          },
          {
            path : 'member',
            module : MemberModule
          },
          {
            path : 'dashboard',
            module : DashboardModule
          }
        ]
      }
    ]),
    AdminModule,
    AuthModule,
    InquiryModule,
    NotificationModule,
    UserModule,
    MemberModule,
    DashboardModule,
    TerminusModule
  ],
  controllers: [
    HealthController
  ],
  providers: [],
})
export class AppModule {}
