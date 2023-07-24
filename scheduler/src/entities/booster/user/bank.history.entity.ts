import { CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BusinessBank } from "./business.bank.entity";
import { UserBusiness } from "./user.business.entity";

@Entity({
  name : SchemaNames.bank_history,
  database : Database.BOOSTER
})
@Index([
  'bank',
  'business',
  'trade_date'
])
export class BankHistory extends BaseEntity{

  @ManyToOne(
    () => UserBusiness,
    business => business.histories,
    CHILD_CASCADE_OPTION
  )
  @JoinColumn({ 
    name : 'business',
    referencedColumnName : 'id'
  })
  @Column({
    type : 'varchar',
    collation : COLLATION, 
    length : 36,
    nullable : false,
    primary : true
  }) 
  business : UserBusiness;

  @ManyToOne(
    () => BusinessBank,
    business_bank => business_bank.histories,
    CHILD_CASCADE_OPTION
  )
  @JoinColumn({ 
    name : 'bank',
    referencedColumnName : 'id'
  })
  @Column({
    type : 'varchar',
    collation : COLLATION, 
    length : 36,
    nullable : false,
    primary : true
  }) 
  bank : BusinessBank;

  @Column({
    type : 'datetime',
    primary : true,
    comment : 'trDt 거래일자 (YYYYMMDD) + trTm 거래시간 (HHMMSS)'
  })
  trade_date : string;
  
  @Column({
    comment : 'trRnd 납입회차 (적금/청약)',
    type : 'mediumint',
    default : null,
    nullable : true,
  })
  trade_turnover : number;
  
  @Column({
    comment : 'wlbn 월분 (적금/청약)',
    type : 'varchar',
    length : '10',
    default : null,
    nullable : true,
    collation : COLLATION,
  })
  trade_month : string;
  
  @Column({
    comment : 'inAmt 입금액',
    type : 'decimal',
    precision : 12,
    scale : 0,
    default : 0,
    nullable : true,
  })
  in_amount : number;
  
  @Column({
    comment : 'outAmt 출금액',
    type : 'decimal',
    precision : 12,
    scale : 0,
    default : 0,
    nullable : true,
  })
  out_amount : number;
  
  @Column({
    comment : 'balance 잔액',
    type : 'decimal',
    precision : 12,
    scale : 0,
    default : 0,
    nullable : true,
  })
  balance : number;
  
  @Column({
    comment : 'trBr 거래점명',
    collation : COLLATION,
    type : 'varchar',
    length : 255,
    nullable : true,
    default : null,
  })
  trade_branch : string;
  
  @Column({
    comment : 'trNm 거래자명',
    collation : COLLATION,
    type : 'varchar',
    length : 255,
    nullable : true,
    default : null,
  })
  trade_name : string;
  
  @Column({
    comment : 'trTp 거래내용(적요)',
    collation : COLLATION,
    type : 'text',
    nullable : true,
    default : null,
  })
  trade_desc : string;
  
  @Column({
    comment : 'trDetail 거래내용상세',
    collation : COLLATION,
    type : 'text',
    nullable : true,
    default : null,
  })
  trade_detail : string;
  
  @Column({
    comment : 'memo 송금메모',
    collation : COLLATION,
    type : 'text',
    nullable : true,
    default : null,
  })
  memo : string;
  
  @Column({
    comment : 'curCd 통화코드',
    collation : COLLATION,
    type : 'varchar',
    length : 40,
    nullable : true,
    default : null,
  })
  currency_code : string;

  @Column({
    comment : 'recvAcctNo 상대방 계좌번호',
    collation : COLLATION,
    type : 'varchar',
    length : 50,
    nullable : true,
    default : null,
  })
  receive_account_no: string;

  @Column({
    comment : 'recvAcctHolder 받는사람 예금주',
    collation : COLLATION,
    type : 'varchar',
    length : 255,
    nullable : true,
    default : null,
  })
  receive_account_holder: string;

  @Column({
    comment : 'sendAcctNo 입금시 입금계좌번호',
    collation : COLLATION,
    type : 'varchar',
    length : 50,
    nullable : true,
    default : null,
  })
  send_account_no: string;

  @Column({
    comment : 'sendAcctHolder 입금시 입금계좌 예금주',
    collation : COLLATION,
    type : 'varchar',
    length : 50,
    nullable : true,
    default : null,
  })
  send_account_holder: string;  
}