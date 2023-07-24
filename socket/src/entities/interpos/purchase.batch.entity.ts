import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CardApprBatch } from "./cardappr.batch.entity";

@Entity({
  name : SchemaNames.purchase_batch,
  database : Database.INTERPOS,
  synchronize : false
})
export class PurchaseBatch extends BaseEntity {
  @Column({
    type : 'char',
    nullable : false,
    length : 1,
  })
  record: string; 

  @Column({
    type : 'varchar',
    length : 5,
    default : null
  })
  classification : string;

  @Column({
    type : 'date',
    default : null,
    comment : '매출일자 (승인일자와 동일)',
    primary : true
  })
  sales_date : Date;

  @Column({
    type : 'date',
    default : null,
    comment : '접수일자 (카드사 접수일자)'
  })
  receipt_date : Date;

  @Column({
    type : 'varchar',
    length : 20,
    default : null,
  })
  card_no : string;

  @Column({
    type : 'int',
    default : 0,
    comment : '할부 기간'
  })
  installment : string;

  @Column({
    type : 'varchar',
    length : 10,
    default : null,
    comment : '승인번호'
  })
  appr_no : string;

  @Column({
    type : 'varchar',
    length : 5,
    default : null,
    comment : '반송 코드 (카드사 반송 코드)'
  })
  return_card_code : string;

  @Column({
    type : 'varchar',
    length : 5,
    default : null,
    comment : '반송 코드 (KS-NET 반송 코드)'
  })
  return_ksnet_code : string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    comment : '거래 금액'
  })
  transaction_amount : string;

  @Column({
    type : 'varchar',
    length : 5,
    default : null,
    comment : '카드사 코드 (매입사 코드)'
  })
  card_code : string;

  @Column({
    type : 'varchar',
    length : 20,
    default : null,
    comment : '카드사 가맹점 번호'
  })
  member_key : string;

  @Column({
    type : 'varchar',
    length : 5,
    default : 'Y',
    comment : '매입 / 매입 취소 구분'
  })
  purchase_appr_yn : string;

  @Column({
    type : 'varchar',
    length : 20,
    default : null,
    comment : '가맹점 사용 영역'
  })
  member_use_area : string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    comment : '수수료 (수신 불가/반송의 경우 0)'
  })
  fees : string;

  @Column({
    type : 'varchar',
    length : 150,
    default : null,
    comment : '추가 데이터 (없으면 null)'
  })
  filler : string;

  @Column({
    type : 'date',
    default : null,
    comment : '지급 일자'
  })
  payment_date : string;

  @ManyToOne(
    () => CardApprBatch,
    card => card.purchases,
    CHILD_CASCADE_OPTION
  )
  @JoinColumn({
    name : 'termid'
  })
  // @Column({
  //   type : 'varchar',
  //   length : 10,
  //   default : null,
  //   comment : '단말기 번호'
  // })
  termid : CardApprBatch;
  

}