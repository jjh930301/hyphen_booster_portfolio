import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Alert } from "src/entities/booster/user/alert.entity";
import { CrefiaCardProvider } from "src/modules/booster/crefia.card.provider";
import { CrefiaDepositProvider } from "src/modules/booster/crefia.deposit.provider";
import { CrefiaFeeProvider } from "src/modules/booster/crefia.fee.provider";
import { CrefiaPurchaseProvider } from "src/modules/booster/crefia.purchase.provider";
import { CrefiaUnPurchaseProvider } from "src/modules/booster/crefia.unpurchase.provider";
import { TokenProvider } from "src/modules/booster/token.provider";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { CrefiaService } from "./crefia.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...TokenProvider.models,
      ...CrefiaCardProvider.models,
      ...CrefiaPurchaseProvider.models,
      ...CrefiaDepositProvider.models,
      ...CrefiaUnPurchaseProvider.models,
      ...CrefiaFeeProvider.models,
      Alert
    ]),
    ScheduleModule.forRoot()
  ],
  providers : [
    CrefiaService,
    UserProvider,
    TokenProvider,
    CrefiaCardProvider,
    CrefiaDepositProvider,
    CrefiaPurchaseProvider,
    CrefiaUnPurchaseProvider,
    CrefiaFeeProvider,
    AlertProvider
  ]
})
export class CrefiaModule {}