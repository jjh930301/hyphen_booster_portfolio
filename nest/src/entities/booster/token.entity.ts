import { COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
  name : SchemaNames.token,
  database : Database.BOOSTER
})
export class Token {
  @Column({
    type : 'tinyint',
    primary : true,
    comment : '0 : hyphen access token'
  })
  type : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 255,
    comment : 'token'
  })
  token : string;

  @CreateDateColumn({
    name : 'created_at',
    comment : '생성일'
  })
  created_at : Date;

  @UpdateDateColumn({
    name : 'updated_at',
    comment : '업데이트일'
  })
  updated_at : Date;
}