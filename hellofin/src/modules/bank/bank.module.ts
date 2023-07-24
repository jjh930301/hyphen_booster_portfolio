import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authenticator } from 'src/middlewares/authenticator.middleware';
import { UserProvider } from '../user/user.provider';
import { BankController } from './bank.controller';
import { BankHistoryProvider } from './bank.history.provider';
import { BankProvider } from './bank.provider';
import { BankService } from './bank.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...UserProvider.models
    ])
  ],
  controllers: [BankController],
  providers: [
    BankService,
    BankProvider,
    UserProvider,
    BankHistoryProvider
  ]
})
export class BankModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Authenticator).forRoutes(BankController);
  }
}
