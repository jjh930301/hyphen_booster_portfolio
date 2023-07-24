import { InternalServerErrorException } from "@nestjs/common";
import { COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { hash } from "src/utils/crypto";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name : SchemaNames.admin_users,
  database : Database.BOOSTER_ADMIN
})
export class AdminUser extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id : string;

  @Column({
    type : 'varchar',
    length : 6,
    collation : COLLATION,
    nullable : true,
  })
  user_num : string

  @Column({
    type : 'varchar',
    length : 10,
    collation : COLLATION,
    comment : '관리자 이름'
  })
  name : string;

  @Column({
    type : 'varchar',
    length : 30,
    unique : true,
    collation : COLLATION,
    comment : '유저 id'
  })
  @Index()
  user_id : string;

  @Column({
    type : 'varchar',
    length : 100,
    comment : 'email',
    collation : COLLATION,
    nullable : false
  })
  @Index()
  email : string;

  @Column({
    type : 'varchar',
    length : 15,
    comment : 'mobile',
    collation : COLLATION,
    nullable : false
  })
  mobile : string;

  @Column({
    type : 'varchar',
    length : 255,
    comment : '비밀번호',
    collation : COLLATION,
  })
  password : string;

  @Column({
    type : 'tinyint',
    comment : '실패 횟수',
    default : 0
  })
  count : number;

  @Column({
    type : 'tinyint',
    default : 1,
    comment : '관리자 권한 0 : 최고 관리자 , 1 : 관리자'
  })
  type : number;

  @Column({
    type : 'tinyint',
    default : 0,
    comment : '0 : 사용 , 1 : 중지 , 2 : 해지'
  })
  status : number;

  @Column({
    type : 'varchar',
    length : 355,
    comment : 'refresh token',
    collation : COLLATION,
  })
  refresh_token : string;

  @Column({
    type : 'datetime',
    default : () => 'CURRENT_TIMESTAMP',
    comment : '최종 로그인',
  })
  login_at : Date;

  @Column({
    type : 'datetime',
    default : null,
    comment : '중지일'
  })
  stoped_at : Date;

  @Column({
    type : 'datetime',
    default : null,
    comment : '해지일'
  })
  terminated_at : Date;

  @CreateDateColumn({
    name : 'created_at',
    comment : '생성일'
  })
  created_at : Date;

  @BeforeInsert()
  public async hashedPassword() {
    try {
      if(this.password) {
        this.password = await hash(this.password);
      }
    } catch(e) {
      throw new InternalServerErrorException({
        message : 'Failed update password',
        payload : {
          result : null
        },
        status_code : 5005
      })
    }
  }
  @BeforeUpdate()
  public async createUserNum() {
    try {
      if(this.user_num === null) {
        this.user_num = `MA-${this.id}`;
      }
    } catch(e) {
      throw new InternalServerErrorException({
        message : 'Failed update user_num',
        payload : {
          result : null
        },
        status_code : 5006
      })
    }
  }
}