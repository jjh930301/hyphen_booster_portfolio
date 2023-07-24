import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Authenticator } from "src/middlewares/authenticator.middleware";
import { TokenProvider } from "src/modules/booster/token.provider";
import { HometaxCashSalesProvider } from "src/modules/user/hometax/hometax.cash.sales.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { CashSalesController } from "./cash.sales.controller";
import { CashSalesService } from "./cash.sales.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...HometaxCashSalesProvider.models,
      ...TokenProvider.models
    ])
  ],
  controllers : [CashSalesController],
  providers : [
    CashSalesService,
    HometaxCashSalesProvider,
    UserProvider,
    TokenProvider,
  ]
})
export class CashSalesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Authenticator).forRoutes(CashSalesController)
  }
}