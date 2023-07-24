import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HometaxCashSales } from "src/entities/booster/hometax/hometax.cash.sales.entity";
import { CrefiaCardProvider } from "src/modules/booster/crefia.card.provider";
import { CrefiaDepositProvider } from "src/modules/booster/crefia.deposit.provider";
import { CrefiaPurchaseProvider } from "src/modules/booster/crefia.purchase.provider";
import { DeliveryDepositProvider } from "src/modules/booster/delivery.deposit.provider";
import { DeliveryProvider } from "src/modules/booster/delivery.provider";
import { HometaxCashSalesProvider } from "src/modules/booster/hometax.cash.sales.provider";
import { HometaxProvider } from "src/modules/booster/hometax.provider";
import { HometaxTaxProvider } from "src/modules/booster/hometax.tax.provider";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { ReportProvider } from "./report.provider";
import { ReportService } from "./report.service";
import { ReportV2Service } from "./report.v2.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...CrefiaCardProvider.models,
      ...CrefiaPurchaseProvider.models,
      ...DeliveryProvider.models,
      ...HometaxProvider.models,
      ...CrefiaDepositProvider.models,
      ...DeliveryDepositProvider.models
    ]),
    ScheduleModule.forRoot()
  ],
  providers : [
    ReportService,
    ReportV2Service,
    UserProvider,
    CrefiaCardProvider,
    CrefiaPurchaseProvider,
    DeliveryProvider,
    HometaxProvider,
    ReportProvider,
    HometaxCashSalesProvider,
    HometaxTaxProvider,
    AlertProvider,
    CrefiaDepositProvider,
    DeliveryDepositProvider
  ]
})
export class ReportModule {

}