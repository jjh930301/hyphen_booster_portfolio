import { COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name : SchemaNames.version,
  database : Database.BOOSTER,
  synchronize : true
})
export class Version extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10,
    nullable : false,
    default : '1.0.0'
  })
  version : string;

  @CreateDateColumn()
  created_at : Date
}