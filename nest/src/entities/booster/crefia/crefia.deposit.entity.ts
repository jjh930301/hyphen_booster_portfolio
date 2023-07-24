import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { UserBusiness } from "../user/user.business.entity";

@Entity({
  name : SchemaNames.crefia_deposit,
  database : Database.BOOSTER
})
@Index([
  'business',
  'payment_date',
  'member_no',
  'account_no',
])
export class CrefiaDeposit extends BaseEntity {

  @ManyToOne(
    () => UserBusiness,
    business => business.crefia_deposits,
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
    type : 'date',
    nullable : false,
    primary : true,
    comment : '입금일자 payDt'
  })
  payment_date : Date;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10,
    nullable : false,
    primary : true,
    comment : '카드사명 cardCorp1'
  })
  card_company : string;

  @Column({
    type : 'tinyint',
    default : 0,
    nullable : true,
    comment : '카드사 검색 코드'
  })
  card_code : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 12,
    nullable : false,
    comment : '가맹점 번호 memNo',
    primary : true
  })
  member_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10,
    nullable : false,
    primary : true,
    comment : '결제 은행 bank'
  })
  bank : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    nullable : false,
    primary : true,
    comment : '결제 계좌 acctNo'
  })
  account_no : string;

  @Column({
    type : 'int',
    default : 0,
    nullable : false,
    primary : true,
    comment : '매출건수 salesCnt'
  })
  sales_count : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : false,
    primary : true,
    comment : '매출금액 salesAmt'
  })
  sales_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : false,
    primary : true,
    comment : '보류금액 detAmt'
  })
  det_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : false,
    primary : true,
    comment : '기타입금 etcAmt'
  })
  etc_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : false,
    primary : true,
    comment : '살제 입금액 realPayAmt'
  })
  real_payment_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : false,
    primary : true,
    comment : '부가세 대리납부 금액? commVat'
  })
  commission_vat : number;

  @Column({
    type : 'boolean',
    default : false,
    comment :'미입금 , 추가입금분에 대한 유저 입력 ex) 확인 후 true'
  })
  status : boolean;

}