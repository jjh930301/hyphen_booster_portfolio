import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { UserBusiness } from "../user/user.business.entity";

@Entity({
  name : SchemaNames.hometax_cash_purchases,
  database : Database.BOOSTER
})
@Index([
  'business',
  'trade_date',
  'approval_no'
])
export class HometaxCashPurchase extends BaseEntity{

  @ManyToOne(
    () => UserBusiness,
    business => business.hometax_cash_purchases,
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
    length : 200,
    nullable : true,
    comment : '가맹점 useStore'
  })
  use_store : string;
  
  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    nullable : true,
    comment : '가맹점사업자번호 storeNo'
  })
  store_no : string;
  
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
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '총금액 totAmt'
  })
  total_amount : number;
  
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
    type : 'tinyint',
    nullable : true,
    comment : '거래구분'
  })
  trade_type : number;
  
  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    nullable : true,
    comment : '공제여부 ddcYn'
  })
  deduction_division : string;
  
  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    nullable : true,
    comment : '사업자구분 bmanClNm'
  })
  business_division : string;
  
  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    nullable : true,
    comment : '업종코드 tfbCd'
  })
  sector_code : string;
  
  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    comment : '업종명 tfbNm'
  })
  sector_name : string;
  
  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    nullable : true,
    comment : '발행구분코드 cshptTrsTypeCd'
  })
  issue_division : string;
  
  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    nullable : true,
    comment : '발행구분명 cshptTrsTypeNm'
  })
  publication_category : string;
  
  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 150,
    nullable : true,
    comment : '소재지(도로명) roadAdr'
  })
  road_address : string;
  
  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 150,
    nullable : true,
    comment : '소재지(법정동) ldAdr'
  })
  area_address : string;
  
}