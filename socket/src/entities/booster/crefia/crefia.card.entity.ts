import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { UserBusiness } from '../user/user.business.entity';

@Entity({
  name : SchemaNames.crefia_card,
  database : Database.BOOSTER,
})
@Index([
  'business',
  'pk_date',
  'approval_no',
  'trade_division',
])
export class CrefiaCard extends BaseEntity{

  @ManyToOne(
    () => UserBusiness,
    business => business.crefia_cards,
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
    comment : 'pk로 사용할 date',
    primary : true,
    nullable : false
  })
  pk_date : Date;

  @Column({
    type : 'datetime',
    comment : '거래 일 / 시간 trDt + trTm',
    nullable : false,
  })
  trade_date : Date;

  @Column({
    type : 'tinyint',
    default : 1,
    nullable : false,
    primary : true,
    comment : '구분 1 : 승인 / 2 : 취소 trDiv'
  })
  trade_division : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10,
    default : null,
    nullable : true,
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
    length : 10,
    default : null,
    nullable : true,
    comment : '제휴사명 cardCorp2'
  })
  card_alliance : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    comment : '카드번호 cardNum',
    nullable : false,
  })
  card_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10,
    comment : '승인번호 apprNo',
    primary : true,
    nullable : false,
  })
  approval_no : string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '승인금액 apprAmt'
  })
  approval_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '수수료 만든 값'
  })
  commission : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 8,
    default : null,
    nullable : true,
    comment : '할부기간 일시불 / 0 개월'
  })
  inst_division : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 12,
    default : null,
    nullable : false,
    comment : '가맹점 번호 merNo',
  })
  member_no : string;

  @Column({
    type : 'tinyint',
    default : 0,
    nullable : true,
    comment : '카드구분코드 1 신용 / 2 체크 cardKndCd'
  })
  card_kind_code : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 4,
    default : '0',
    nullable : false,
    comment : '카드구분 신용 / 체크 cardKnd'
  })
  card_kind : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 60,
    default : null,
    nullable : true,
    comment : '암호화된 카드 번호 cardRealNo'
  })
  card_real_no : string;

  @Column({
    type : 'int',
    default : 0,
    nullable : true,
    comment : '할부개월 0 / 00 insTrm'
  })
  inst : number;

  @Column({
    type : 'datetime',
    default : null,
    nullable : true,
    comment : '원거래 승인일 (취소일 때만 담깁니다)'
  })
  origin_trade_date : Date

}