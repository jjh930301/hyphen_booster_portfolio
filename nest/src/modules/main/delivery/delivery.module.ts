import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Authenticator } from "src/middlewares/authenticator.middleware";
import { TokenProvider } from "src/modules/booster/token.provider";
import { AlertProvider } from "src/modules/user/alert/alert.provider";
import { BaeminService } from "src/modules/user/delivery/baemin.service";
import { DeliveryDepositProvider } from "src/modules/user/delivery/delivery.deposit.provider";
import { DeliveryProvider } from "src/modules/user/delivery/delivery.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { DeliveryController } from "./delivery.controller";
import { DeliveryService } from "./delivery.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...TokenProvider.models,
      ...DeliveryProvider.models,
      ...DeliveryDepositProvider.models
    ]),
  ],
  controllers : [DeliveryController],
  providers : [
    DeliveryService,
    DeliveryProvider,
    DeliveryDepositProvider,
    UserProvider,
    TokenProvider,
    AlertProvider,
    BaeminService
  ]
})
export class DeliveryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Authenticator)
      .forRoutes(DeliveryController)
  }
}