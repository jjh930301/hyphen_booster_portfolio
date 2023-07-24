import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity({
  name : SchemaNames.inquiries,
  database : Database.BOOSTER
})
export class Inquiry extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column({
    type : 'tinyint',
    comment : `0 : 사업자등록번호 추가 / 1 : 의견 보내기 / 2 : 서비스 오류 문의 / 3 : 이벤트 문의 / 4 : 기타`,
    nullable : false,
    default : 0
  })
  type : number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 255,
    comment : '문의 제목'
  })
  title : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    comment : '문의 내용'
  })
  description : string;
  
  @Column({
    type : 'simple-array',
    nullable : true,
    comment : 'inquiry images',
  })
  images : string[];

  @ManyToOne(
    () => User,
    user => user.inquiries,
    CHILD_CASCADE_OPTION
  )
  @JoinColumn({
    name : 'user'
  })
  user : User;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 255,
    default : '',
    comment : '답변 제목',
    nullable : true
  })
  answer_title : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    comment : '답변 내용',
    nullable : true
  })
  answer_description : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    comment : '답변한 관리자',
    nullable : true
  })
  answer_admin : string;

  @Column({
    type : 'datetime',
    default : null,
    nullable : true
  })
  answered_at : Date;

  @Column({
    type : 'tinyint',
    comment : `
      문의 상태
      0 : 미답변
      1 : 확인중
      2 : 답변
    `
  })
  status : number;

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
  deleted_at : Date
}