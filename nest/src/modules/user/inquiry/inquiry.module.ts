import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Authenticator } from "src/middlewares/authenticator.middleware";
import { UserProvider } from "../user.provider";
import { InquiryController } from "./inquiry.controller";
import { InquiryProvider } from "./inquiry.provider";
import { InquiryService } from "./inquiry.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...InquiryProvider.models
    ])
  ],
  controllers : [InquiryController],
  providers : [
    InquiryService,
    InquiryProvider,
    UserProvider
  ]
})
export class InquiryModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(InquiryController)
  }
}