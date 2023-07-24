import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { AdminProvider } from '../admin/admin.provider';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...AdminProvider.models
    ])
  ],
  controllers: [MemberController],
  providers: [
    MemberService,
    AdminProvider
  ]
})
export class MemberModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Authenticator).forRoutes(MemberController)
  }
}
