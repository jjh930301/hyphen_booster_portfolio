import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Alert } from "src/entities/booster/user/alert.entity";
import { HometaxProvider } from "src/modules/booster/hometax.provider";
import { TokenProvider } from "src/modules/booster/token.provider";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { HometaxService } from "./hometax.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...TokenProvider.models,
      ...HometaxProvider.models,
      Alert
    ]),
    ScheduleModule.forRoot()
  ],
  providers : [
    UserProvider,
    TokenProvider,
    HometaxService,
    HometaxProvider,
    AlertProvider
  ]
})
export class HometaxModule {}