import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeliveryDepositProvider } from "src/modules/booster/delivery.deposit.provider";
import { DeliveryProvider } from "src/modules/booster/delivery.provider";
import { AlertProvider } from "src/modules/user/alert.provider";
import { UserProvider } from "src/modules/user/user.provider";
import { CertProvider } from "./cert.provider";
import { CertService } from "./cert.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models,
      ...DeliveryProvider.models,
      ...DeliveryDepositProvider.models,
    ]),
  ],
  providers : [
    UserProvider,
    CertService,
    DeliveryProvider,
    DeliveryDepositProvider,
    CertProvider,
    AlertProvider
  ]
})
export class CertModule {}