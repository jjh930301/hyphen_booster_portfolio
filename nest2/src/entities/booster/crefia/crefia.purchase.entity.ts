import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { UserBusiness } from "../user/user.business.entity";

@Entity({
  name : SchemaNames.crefia_purchases,
  database : Database.BOOSTER,
})
@Index([
  'business',
  'buy_date',
  'approval_no',
  'card_no'
])
export class CrefiaPurchase extends BaseEntity {

  @ManyToOne(
    () => UserBusiness,
    business => business.crefia_purchases,
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
    comment : '거래일자 trDt',
    nullable : true
  })
  trade_date : string;

  @Column({
    type : 'date',
    comment : '매입일자 buyDt',
    nullable : false,
    primary : true
  })
  buy_date : string;

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
    primary : true,
    nullable : false,
  })
  card_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 4,
    default : null,
    nullable : true,
    comment : '카드구분 신용 / 체크 cardDiv'
  })
  card_division : string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '매입금액 buyAmt'
  })
  buy_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '수수료 가맹점 commMem',
  })
  commission_member : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '수수료 포인트 commPoint'
  })
  commission_point : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '수수료 포인트 기타 commEtc'
  })
  commission_etc : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '지급금액 payAmt'
  })
  payment_amount : number;

  @Column({
    type : 'date',
    comment : '지급예정일 payDt',
    nullable : true
  })
  payment_date : Date;

  @Column({
    type : 'tinyint',
    default : 1,
    nullable : true,
    comment : '카드구분코드 1 신용 / 2 체크 cardDivCd'
  })
  card_division_code : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 12,
    nullable : true,
    comment : '가맹점 번호 merNo',
  })
  member_no : string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    comment : '수수료 합계 commSum',
    nullable : true
  })
  commission_sum : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    comment : '부가세 대리납부 금액 commVat',
    nullable : true
  })
  commission_vat : number;

}