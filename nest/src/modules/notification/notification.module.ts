import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { AlertProvider } from '../user/alert/alert.provider';
import { UserProvider } from '../user/user.provider';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models
    ])
  ],
  controllers: [
    NotificationController
  ],
  providers: [
    NotificationService,
    AlertProvider,
    UserProvider,
  ]
})
export class NotificationModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(NotificationController)
  }
}
