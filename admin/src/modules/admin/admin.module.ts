import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminProvider } from './admin.provider';
import { AdminService } from './admin.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      ...AdminProvider.models
    ])
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminProvider
  ]
})
export class AdminModule {}
