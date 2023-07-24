import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Authenticator } from "src/middlewares/authenticator.middleware";
import { TokenProvider } from "src/modules/booster/token.provider";
import { HometaxTaxProvider } from "src/modules/user/hometax/hometax.tax.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { TaxController } from "./tax.controller";
import { TaxService } from "./tax.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...TokenProvider.models,
      ...HometaxTaxProvider.models
    ])
  ],
  controllers : [TaxController],
  providers : [
    TaxService,
    UserProvider,
    TokenProvider,
    HometaxTaxProvider
  ]
})
export class TaxModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Authenticator).forRoutes(TaxController);
  }
}