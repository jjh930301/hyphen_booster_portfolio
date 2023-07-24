import { COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity } from "typeorm";

@Entity({
  name : SchemaNames.cash_batch,
  database : Database.INTERPOS,
  synchronize : false
})
export class CashBatch extends BaseEntity{
  @Column({
    type : 'char',
    nullable : true,
    length : 1,
    comment : `데이터구분`
  })
  record: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10,
    comment : '단말기ID',
    nullable : true
  })
  termid : string;

  @Column({
    type : 'date',
    comment : '요청일자',
    primary : true,
    nullable : true
  })
  req_date : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10,
    comment : '사업자 번호',
    nullable : true
  })
  biz_no : string;

  @Column({
    type : 'char',
    length : 1,
    comment : '원화 구분 Y/N',
    nullable : true
  })
  krw_division : string;

  @Column({
    type : 'char',
    length : 1,
    comment : '거래자구분 (0 : 개인 , 1 : 사업자)',
    nullable : true
  })
  transaction_type : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 5,
    comment : '가맹점 key값',
    nullable : true
  })
  biz_key : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 20,
    comment : '신분확인 (주민번호 , 사업자번호 , 휴대폰)',
    nullable : true
  })
  identification : string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    comment : '판매금액',
    default : 0,
    nullable : true
  })
  sales_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    comment : '세금',
    default : 0,
    nullable : true
  })
  tax : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    comment : '봉사료',
    default : 0,
    nullable : true
  })
  service_charge : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    comment : '총거래금액 (판매금액 + 세금 + 봉사료)',
    default : 0,
    nullable : true
  })
  total_amount : number;

  @Column({
    type : 'date',
    nullable : true,
    comment : '승인일자'
  })
  appr_date : Date;

  @Column({
    type : 'time',
    nullable : true,
    comment : '승인시간'
  })
  appr_time : string;

  @Column({
    type : 'date',
    nullable : true,
    comment : '원승인일자'
  })
  origin_appr_date : Date;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 10,
    nullable : true,
    comment : '승인번호'
  })
  appr_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 5,
    nullable : true,
    comment : '거절코드 (거절코드표 확인)'
  })
  reject_code : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    comment : '추가 데이터 없으면 null'
  })
  filler : string;
}