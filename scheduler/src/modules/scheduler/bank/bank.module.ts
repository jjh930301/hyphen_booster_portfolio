import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserProvider } from "src/modules/user/user.provider";
import { BankHistoryProvider } from "./bank.history.provider";
import { BankProvider } from "./bank.provider";
import { BankService } from "./bank.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models
    ]),
    ScheduleModule.forRoot()
  ],
  providers : [
    UserProvider,
    BankProvider,
    BankHistoryProvider,
    BankService
  ]
})
export class BankModule {}