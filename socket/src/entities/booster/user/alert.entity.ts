import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { UserBusiness } from "./user.business.entity";

@Entity({
  name : SchemaNames.alerts,
  database : Database.BOOSTER
})
export class Alert extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    comment : '알림 타이틀'
  })
  title : string;

  @Column({
    type : 'mediumtext',
    collation : COLLATION,
    comment : '알림 내용'
  })
  body : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    comment : '이동해야할 페이지 값 dynamic하게 들어갈 수 있습니다. ',
    nullable : true,
  })
  event : string;

  @Column({
    type : 'tinyint',
    comment : '이벤트 타입',
    nullable : true,
  })
  event_type : number;

  @Column({
    type : 'boolean',
    comment : '공지사항',
    default : false
  })
  is_public : boolean;

  @Column({
    type : 'boolean',
    comment : '게시 | 미게시',
    default : true
  })
  is_open : boolean;

  @Column({
    type : 'boolean',
    comment : "읽음 처리",
    default : false
  })
  is_read : boolean

  @ManyToOne(
    () => UserBusiness,
    business => business.alerts,
    CHILD_CASCADE_OPTION
  )
  @JoinColumn({
    name : 'business'
  })
  business : UserBusiness

  @Column({
    type : 'datetime',
    nullable : true,
    default : null,
    comment : 'send fcm datetime'
  })
  pushed_at : Date

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '관리자 이름'
  })
  admin_id : string;

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
}