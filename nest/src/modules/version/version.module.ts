import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Version } from 'src/entities/booster/version.entity';
import { VersionController } from './version.controller';
import { VersionProvider } from './version.provider';
import { VersionService } from './version.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      Version
    ])
  ],
  controllers: [VersionController],
  providers: [
    VersionService,
    VersionProvider
  ]
})
export class VersionModule {}
