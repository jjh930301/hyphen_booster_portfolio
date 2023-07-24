import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BankHistory } from "./bank.history.entity";
import { UserBusiness } from "./user.business.entity";

@Entity({
  name : SchemaNames.business_bank,
  database : Database.BOOSTER
})
@Index([
  'id',
  'business',
  'bank_type'
])
export class BusinessBank extends BaseEntity {
  // account도 null이 들어올 수 있고 계좌가 여러개가 생길 수 있다고 함
  @PrimaryGeneratedColumn('uuid')
  id : string; 

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
    type : 'varchar',
    length : 30,
    collation : COLLATION, 
    default : null,
    nullable : true,
    comment : '계좌번호'
  })
  account : string;

  @Column({
    type : 'varchar',
    length : 100,
    collation : COLLATION,
    default : null,
    nullable : true,
    comment : '계좌 이름'
  })
  account_name : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    default : null,
    nullable : true,
    comment : '우리은행은 계좌 비밀번호 필수'
  })
  account_password : string;

  @Column({
    type : 'tinyint',
    default : 0,
    nullable : true,
    comment : '개인 : 1 / 기업 : 2'
  })
  type : number;

  @Column({
    type : 'varchar',
    length : 5,
    default : null,
    collation : COLLATION,
    nullable : true,
    comment : '은행 타입 하이픈 데이터마켓 코드표 기준'
  })
  bank_type : string;

  @Column({
    type : 'varchar',
    length : 255,
    collation : COLLATION,
    nullable : true,
    default : null,
    comment : '인증서 번호'
  })
  cert_number : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    default : null,
    nullable : true
  })
  cert : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    default : null,
    nullable : true
  })
  pri : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    default : null,
    nullable : true
  })
  cert_password : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 255,
    default : null,
    nullable : true,
  })
  bank_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 255,
    default : null,
    nullable : true,
  })
  bank_password : string;

  @Column({
    type : 'tinyint',
    default : 0,
    comment : '0 : none / 1 : 선정산'
  })
  is_paid : number;

  @Column({
    type : 'tinyint',
    comment : '선정산 오픈 상태',
    default : 0
  })
  paid_open : number;

  @Column({
    type : 'date',
    nullable : true,
    default : null
  })
  paid_opened_at : Date;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    default : null,
    comment : '영업사원 아이디',
    nullable : true,
  })
  sales_person : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    default : null,
    comment : '영업사원 아이디',
    nullable : true,
  })
  sales_person_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    default : null,
    comment : '영업사원 영업 연락처',
    nullable : true,
  })
  sales_person_mobile : string;

  @Column({
    type : 'date',
    default : null,
    comment : '계약일자',
    nullable : true,
  })
  contracted_at : string;

  @Column({
    type : 'date',
    default : null,
    comment : '계약 종료 일자',
    nullable : true,
  })
  contract_ended_at : string;

  @Column({
    type : 'date',
    default : null,
    comment : '출금시작 일자',
    nullable : true,
  })
  paid_started_at : string;

  @Column({
    type : 'date',
    default : null,
    comment : '출금종료 일자',
    nullable : true,
  })
  paid_ended_at : string;

  @Column({
    type : 'tinyint',
    default : 0,
    comment : '상태값 0 : none / 1 : 승인 / 2 : 해지 / 3 : 반려',
  })
  status : number;

  @Column({
    type : 'boolean',
    default : false
  })
  is_login : boolean;

  @OneToMany(
    () => BankHistory,
    history => history.bank,
    CASCADE_OPTION
  )
  histories : Array<BankHistory> 

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : '최근에 데이터를 업데이트한 시간'
  })
  recent_at : Date;

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : '연결시간'
  })
  connected_at : Date;

  @CreateDateColumn({
    name : 'created_at',
    comment : '생성일'
  })
  created_at : Date;

  @UpdateDateColumn({
    name : 'updated_at',
    comment : '최근 업데이트일(정보)'
  })
  updated_at : Date;

  @DeleteDateColumn({
    name : 'deleted_at',
    comment : '삭제일'
  })
  deleted_at : Date;
}