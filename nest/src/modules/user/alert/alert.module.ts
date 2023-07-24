import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from 'src/entities/booster/user/alert.entity';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { UserProvider } from '../user.provider';
import { UserService } from '../user.service';
import { AlertController } from './alert.controller';
import { AlertProvider } from './alert.provider';
import { AlertService } from './alert.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      Alert,
      ...UserProvider.models
    ])
  ],
  controllers : [AlertController],
  providers : [
    AlertProvider,
    AlertService,
    UserProvider
  ]
})
export class AlertModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Authenticator).forRoutes(AlertController)
  }
}
