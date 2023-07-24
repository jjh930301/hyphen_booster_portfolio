import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { AdminProvider } from '../admin/admin.provider';
import { BusinessAlertProvider } from '../user/business.alert.provider';
import { UserDeviceProvider } from '../user/user.device.provider';
import { UserProvider } from '../user/user.provider';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...AdminProvider.models,
    ])
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationService,
    BusinessAlertProvider,
    AdminProvider,
    UserDeviceProvider
  ]
})
export class NotificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Authenticator).forRoutes(NotificationController)
  }
}
