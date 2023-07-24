import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { UserBusiness } from "../user/user.business.entity";

@Entity({
  name : SchemaNames.hometax_cash_sales,
  database : Database.BOOSTER
})
@Index([
  'business',
  'trade_date',
  'approval_no'
])
export class HometaxCashSales extends BaseEntity {
  @ManyToOne(
    () => UserBusiness,
    business => business.hometax_cash_sales,
    CHILD_CASCADE_OPTION
  )
  @JoinColumn({
    name : 'business',
  })
  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 36,
    nullable : false,
    primary : true
  })
  business : UserBusiness;

  @Column({
    type : 'datetime',
    comment : '거래 일 / 시간 trDt + trTm',
    primary : true,
    nullable : false,
  })
  trade_date : Date;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10,
    nullable : true,
    comment : '발행구분 issueGb'
  })
  issue_division : string;

  @Column({
    type : 'tinyint',
    nullable : true,
    comment : '거래구분'
  })
  trade_type : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '공급가액 supAmt'
  })
  supply_amount : number;
  
  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '부가세 taxAmt'
  })
  tax_amount : number;
  
  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '봉사료 tip'
  })
  tip : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    comment : '승인번호 apprNo',
    primary : true
  })
  approval_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    nullable : true,
    comment : '발급수단 frPartNo'
  })
  issue_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10,
    nullable : true,
    comment : '거래구분 trGb'
  })
  trade_division : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    nullable : true,
    comment : '비고 cshptTrsTypeNm'
  })
  note : string;

  @Column({
    type : 'date',
    default : null,
    nullable : true,
    comment : '원거래 승인일 (취소일 때만 담깁니다)'
  })
  origin_trade_date : Date;
}