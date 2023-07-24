import { COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({
  name : SchemaNames.holiday,
  database : Database.BOOSTER
})
export class Holiday extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column({
    unique : true,
    nullable : false,
    type : 'varchar',
    collation : COLLATION,
    comment : 'dateName + locdate 조합',
    length : 60
  })
  unique : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10
  })
  date_kind : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    comment : '공휴일 , 국경일 이름'
  })
  date_name : string;

  @Column({
    type : 'boolean',
    comment : '공휴일 Y/N'
  })
  is_holiday : boolean;

  @Column({
    type : 'datetime',
    comment : '날짜'
  })
  locdate : Date;
}