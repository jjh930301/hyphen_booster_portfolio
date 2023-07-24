import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { AdminProvider } from '../admin/admin.provider';
import { UserProvider } from '../user/user.provider';
import { UserBusinessProvider } from '../user/user.business.provider';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...AdminProvider.models
    ])
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    UserProvider,
    UserBusinessProvider,
    AdminProvider
  ]
})
export class DashboardModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(DashboardController)
  }
}
