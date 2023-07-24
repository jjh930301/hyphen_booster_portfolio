import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { AdminProvider } from '../admin/admin.provider';
import { BusinessAlertProvider } from '../user/business.alert.provider';
import { InquiryProvider } from '../user/inquiry.provider';
import { UserBusinessProvider } from '../user/user.business.provider';
import { UserDeviceProvider } from '../user/user.device.provider';
import { UserProvider } from '../user/user.provider';
import { InquiryController } from './inquiry.controller';
import { InquiryService } from './inquiry.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...AdminProvider.models
    ])
  ],
  controllers: [InquiryController],
  providers: [
    InquiryService,
    AdminProvider,
    InquiryProvider,
    UserDeviceProvider,
    BusinessAlertProvider,
    UserBusinessProvider
  ]
})
export class InquiryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Authenticator).forRoutes(InquiryController)
  }
}
