import { COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name : SchemaNames.feedbacks,
  database : Database.BOOSTER
})
export class Feedback extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id : number;

  @Column({
    type : 'tinyint',
    default : 0,
    nullable : false,
    comment : '피드백 타입'
  })
  type : number;

  @Column({
    type : 'text',
    collation : COLLATION,
    nullable : false,
  })
  title : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    nullable : false,
  })
  description : string;

  @Column({
    type : 'varchar',
    length : 100,
    comment : 'user uuid',
    nullable : false
  })
  user_id : string;

  @Column({
    type : 'varchar',
    length : 200,
    comment : 'user business store name',
    nullable : true
  })
  store_name : string;
}