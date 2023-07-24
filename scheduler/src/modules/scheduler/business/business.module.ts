import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserProvider } from "src/modules/user/user.provider";
import { BusinessService } from "./business.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models
    ]),
    ScheduleModule.forRoot()
  ],
  providers : [
    UserProvider,
    BusinessService
  ]
})
export class BusinessModule{}