import { CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PurchaseBatch } from "./purchase.batch.entity";

@Entity({
  name : SchemaNames.card_appr_batch,
  database : Database.INTERPOS,
  synchronize : false
})
export class CardApprBatch extends BaseEntity{

  @Column({
    type : 'char',
    nullable : true,
    length : 1,
    comment : `데이터 타입 K = ksnet , R , C , D`
  })
  record: string;

  @Column({
    type : 'char',
    nullable : false,
    length : 1,
    comment : `카드승인 여부 ('Y' or 'N')`,
    primary : true
  })
  appr_yn: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 10,
    comment : `사업자 번호`
  })
  biz_no: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 20,
    comment : `카드번호 (마스킹 포함)`
  })
  card_no: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 10,
    comment : `카드 유효기간 (YYMM)`
  })
  validity: string;

  @Column({
    type : 'int',
    nullable : true,
    comment : `할부기간`
  })
  installment:string;

  @Column({
    type : 'decimal',
    nullable : true,
    precision : 10,
    scale : 0,
    comment : `승인금액`
  })
  appr_amount: string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    nullable : true,
    comment : `봉사료`
  })
  service_charge: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : false,
    length : 10,
    comment : `승인번호`,
    primary : true
  })
  appr_no: string;

  @Column({
    type : 'datetime',
    nullable : false,
    comment : `승인일자 (카드승인 여부 N일 시 원거래 일자 / YYYY-MM-DD)`,
    primary : true
  })
  appr_date: string;

  @Column({
    type : 'time',
    nullable : true,
    comment : `승인시간 (카드승인 여부 N일 시 원거래 시간 / HH:mm:ss)`
  })
  appr_time: string;

  @Column({
    type : 'datetime',
    nullable : true,
    comment : `취소일자 (YYYY-MM-DD)`
  })
  cancel_date: string;

  @Column({
    type : 'time',
    nullable : true,
    comment : `취소 시간 (HH:mm:ss)`
  })
  cancel_time: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 12,
    comment : `발급사 코드`
  })
  member_no: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 5,
    comment : `매입사 코드`
  })
  bscis_code: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 5,
    comment : `발급사 코드`
  })
  bscpr_code: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50,
    comment : `밴 사 추가 데이터 (없으면 null)`
  })
  filler: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : false,
    length : 10,
    comment : `카드 단말기 ID`,
    primary : true
  })
  termid: string;

  @Column({
    type : 'decimal',
    nullable : true,
    precision : 10,
    scale : 0,
    comment : '현금IC 수수료율'
  })
  comm_rate : number;

  @Column({
    type : 'decimal',
    nullable : true,
    precision : 10,
    scale : 0,
    comment : '현금IC 가맹점 수수료율'
  })
  memb_comm_rate : number;

  @OneToMany(
    () => PurchaseBatch,
    purchase_batch => purchase_batch.termid
  )
  purchases : Array<PurchaseBatch>;

}