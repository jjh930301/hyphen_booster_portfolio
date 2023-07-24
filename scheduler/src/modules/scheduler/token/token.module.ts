import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenProvider } from "src/modules/booster/token.provider";
import { TokenService } from "./token.service";

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...TokenProvider.models
    ])
  ],
  providers : [
    TokenService,
    TokenProvider
  ]
})
export class TokenModule {}