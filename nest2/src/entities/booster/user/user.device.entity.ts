import { InternalServerErrorException } from "@nestjs/common";
import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { OperatingSystemType } from "src/enums/operating.system.typs";
import { hash } from "src/utils/crypto";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({
  name : SchemaNames.user_devices,
  database : Database.BOOSTER,
  orderBy : {
    created_at : 'ASC'
  }
})
export class UserDevice extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    default : null
  })
  password : string;

  @Column({
    type : 'tinyint',
    default : 0,
    nullable : true
  })
  fail_count : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    comment : '앱스토어 다운로드시 떨어지는 고유값',
    nullable : true,
  })
  vendor_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 50,
    comment : '디바이스 이름',
    nullable : false
  })
  device_name : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 255,
    comment : "device_token for fcm",
    nullable : true
  })
  token : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 300,
    comment : 'device refresh token',
    nullable : true
  })
  refresh_token : string;

  @Column({
    type : 'boolean',
    comment : '카드 매출 승인 알림 끄기',
    default : false
  })
  card_sales_approval_alert : boolean;

  @Column({
    type : 'boolean',
    comment : '현금 매출 승인 알림 끄기',
    default : false
  })
  cash_sales_approval_alert : boolean;

  @Column({
    type : 'boolean',
    comment : '카드 매출 취소 알림 끄기',
    default : true
  })
  card_sales_cancel_alert : boolean;

  @Column({
    type : 'boolean',
    comment : '현근 매출 취소 알림 끄기',
    default : true
  })
  cash_sales_cancel_alert : boolean;
  
  @Column({
    type : 'boolean',
    comment : '리포트 알림 끄기',
    default : true
  })
  report_alert : boolean;

  @Column({
    type : 'boolean',
    comment : '미매입/미입금 알림 끄기',
    default : true
  })
  unpaid_unpurchase_alert : boolean;

  @Column({
    type : 'tinyint',
    comment : 'ios | aos | web',
    nullable : false
  })
  operating_system : number

  @ManyToOne(
    () => User,
    user => user.devices,
    CHILD_CASCADE_OPTION
  )
  @JoinColumn({
    name : 'user',
  })
  user : User;
  
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

  @DeleteDateColumn({
    name : 'deleted_at',
    comment : '삭제일'
  })
  deleted_at : Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hash() : Promise<void> {
    try {
      if(this.password) {
        this.password = await hash(this.password);
      }
    } catch(e) {
      throw new InternalServerErrorException();
    }
  }
}