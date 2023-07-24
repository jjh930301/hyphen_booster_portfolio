import { COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name : SchemaNames.withdraw_feedbacks,
  database : Database.BOOSTER
})
export class WithdrawFeedBack extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id : number;

  @Column({
    type : 'tinyint',
    nullable : false,
    comment : '0 : 앱을 사용하지 않음 , 1 : 개인정보가 걱정 , 2 : 오류가 많음 , 3 : 기타'
  })
  type : number;

  @Column({
    type : 'text',
    collation : COLLATION,
    nullable : true,
    default : null
  })
  description : string;

  @Column({
    type : 'varchar',
    length : 36,
    collation : COLLATION,
    comment : '유저 UUID',
    nullable : false
  })
  user_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    comment : '유저 전화번호',
    nullable : false
  })
  user_mobile : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    comment : '유저 이름',
    nullable : false
  })
  user_name : string;

  @Column({
    type : 'tinyint',
    comment : '유저 성별',
    nullable : false
  })
  user_gender : number;

  @CreateDateColumn()
  created_at : Date;
}