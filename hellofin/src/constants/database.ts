import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RelationOptions } from 'typeorm';
import { Constants } from './constants';

const env = process.env.ENV

export class Database {
  static BOOSTER : string = process.env.MYSQL_DATABASE;
  static INTERPOS : string = 'interpos'
}

const config = (
  database,
  syncOption
) : TypeOrmModuleOptions => {
  return {
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: 3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: database,
    entities: [
      __dirname + 'entities/**/*.entity.{.ts,.js}',
      __dirname + 'entities/**/*.*.entity.{.ts,.js}',
      __dirname + 'entities/**/*.*.*.entity.{.ts,.js}',
      __dirname + 'entities/**/**/*.entity.{.ts,.js}',
      __dirname + 'entities/**/**/*.*.entity.{.ts,.js}',
      __dirname + 'entities/**/**/*.*.*.entity.{.ts,.js}',
      __dirname + 'entities/**/**/**/*.entity.{.ts,.js}',
      __dirname + 'entities/**/**/**/*.*.entity.{.ts,.js}',
      __dirname + 'entities/**/**/**/*.*.*.entity.{.ts,.js}',
    ],
    charset: 'utf8mb4',
    autoLoadEntities : true,
    synchronize : syncOption,
    // logging : true,
  }
}

export const Booster : TypeOrmModuleOptions = config(Database.BOOSTER , false)

export const Interpos : TypeOrmModuleOptions = config(Database.INTERPOS , false)

export const CASCADE_OPTION : RelationOptions = {
  onDelete : 'CASCADE',
  onUpdate : 'CASCADE'
}

export const CHILD_CASCADE_OPTION : RelationOptions = {
  onDelete : 'CASCADE'
};

export const COLLATION = 'utf8mb4_unicode_ci';