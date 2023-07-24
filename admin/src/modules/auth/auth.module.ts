import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { AdminProvider } from '../admin/admin.provider';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...AdminProvider.models
    ])
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AdminProvider
  ]
})
export class AuthModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(AuthController)
  }
}
