import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Alert } from "src/entities/booster/user/alert.entity";
import { DeliveryDepositProvider } from "src/modules/booster/delivery.deposit.provider";
import { DeliveryProvider } from "src/modules/booster/delivery.provider";
import { TokenProvider } from "src/modules/booster/token.provider";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { BaeminService } from "./baemin.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...TokenProvider.models,
      ...DeliveryProvider.models,
      ...DeliveryDepositProvider.models,
      Alert
    ]),
    ScheduleModule.forRoot()
  ],
  providers : [
    UserProvider,
    TokenProvider,
    DeliveryProvider,
    BaeminService,
    DeliveryDepositProvider,
    AlertProvider
  ]
})
export class BaeminModule{}