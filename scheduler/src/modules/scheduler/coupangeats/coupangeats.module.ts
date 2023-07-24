import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Alert } from "src/entities/booster/user/alert.entity";
import { DeliveryDepositProvider } from "src/modules/booster/delivery.deposit.provider";
import { DeliveryProvider } from "src/modules/booster/delivery.provider";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { CoupangeatsService } from "./coupangeats.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...DeliveryProvider.models,
      ...DeliveryDepositProvider.models,
      Alert
    ]),
    ScheduleModule.forRoot(),
  ],
  providers : [
    CoupangeatsService,
    UserProvider,
    DeliveryProvider,
    DeliveryDepositProvider,
    AlertProvider,
  ],
})
export class CoupangeatsModule{}