import { CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { UserBusiness } from "../user/user.business.entity";

@Entity({
  name : SchemaNames.crefia_fees,
  database : Database.BOOSTER,
})
@Index([
  'business',
])
export class CrefiaFee extends BaseEntity {
  @ManyToOne(
    () => UserBusiness,
    business => business.crefia_fees,
    CHILD_CASCADE_OPTION
  )
  @JoinColumn({
    name : 'business',
    referencedColumnName : "id"
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
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    default : null,
    nullable : true,
    comment : '카드사명 cardName'
  })
  card_name : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    nullable : false,
    primary : true,
    comment : '가맹점번호 memNo'
  })
  member_group_id : string;

  @Column({
    type : 'decimal',
    precision : 6,
    scale : 3,
    default : 0,
    nullable : true,
    comment : '승인금액 sinYongFeeRate'
  })
  sinyong_fee_rate : number;

  @Column({
    type : 'decimal',
    precision : 6,
    scale : 3,
    default : 0,
    nullable : true,
    comment : '승인금액 checkFeeRateB'
  })
  check_fee_rate_b : number;

  @Column({
    type : 'decimal',
    precision : 6,
    scale : 3,
    default : 0,
    nullable : true,
    comment : '승인금액 checkFeeRateC'
  })
  check_fee_rate_c : number;

  @Column({
    type : 'decimal',
    precision : 6,
    scale : 3,
    default : 0,
    nullable : true,
    comment : '승인금액 pymPeriod'
  })
  payment_period : number;

  @Column({
    type : 'varchar',
    length : 10,
    collation : COLLATION,
    nullable : true,
    comment : '카드코드 cardCd'
  })
  card_code : string;

  @CreateDateColumn({
    name : 'created_at',
    comment : '생성일'
  })
  created_at : Date;

  @UpdateDateColumn({
    name : 'updated_at',
    comment : '최근 업데이트일'
  })
  updated_at : Date;
}