import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserBusiness } from "./user.business.entity";
import { User } from "./user.entity";

@Entity({
  name : SchemaNames.business_report,
  database : Database.BOOSTER
})
export class BusinessReport {
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column({
    type : 'tinyint',
    comment : '1 : 일 / 2 : 월 / 3 : 년'
  })
  type : number;

  @Column({
    type : 'decimal',
    precision : 11,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '이전 판매'
  })
  before_sales : number;

  @Column({
    type : 'decimal',
    precision : 11,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '판매'
  })
  sales : number;

  @Column({
    type : 'decimal',
    precision : 11,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '입금 예정'
  })
  expected_deposit : number;

  @Column({
    type : 'decimal',
    precision : 11,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '지출 (현재 사용하지 않음)'
  })
  expenditure : number;

  @Column({
    type : 'decimal',
    precision : 11,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '입금 (현재 사용하지 않음)'
  })
  deposit : number;

  @Column({
    type : 'decimal',
    precision : 13,
    scale : 2,
    default : 0,
    nullable : true,
    comment : '전일 대비'
  })
  percent : number;

  @ManyToOne(
    () => UserBusiness,
    user => user.reports,
    CHILD_CASCADE_OPTION
  )
  @JoinColumn({
    name : 'business'
  })
  business : UserBusiness;
  
  @Column({
    type : 'date',
    comment : '날짜 월간은 첫번째일',
    nullable : false,
  })
  date : Date;

  @CreateDateColumn({
    name : 'created_at',
    comment : '생성일'
  })
  created_at : Date;
}