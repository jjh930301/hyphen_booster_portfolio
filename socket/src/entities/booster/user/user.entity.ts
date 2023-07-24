import { InternalServerErrorException } from "@nestjs/common";
import { CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { UserGender } from "src/enums/user/user.gender";
import { userType } from "src/enums/user/user.type";
import { Column, Entity, PrimaryGeneratedColumn , ColumnType, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, Index, BeforeInsert} from "typeorm";
import { Inquiry } from "../inquiry/inquiry.entity";
import { UserBusiness } from "./user.business.entity";
import { UserDevice } from "./user.device.entity";

@Entity({
  name : SchemaNames.users,
  database : Database.BOOSTER,
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 255,
    unique : true,
  })
  @Index()
  client_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 255,
  })
  di : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 15,
    nullable : true
  })
  user_num : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    comment : '대표자명'
  })
  name : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    comment : '휴대폰 번호'
  })
  mobile : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 1,
    nullable : true,
    comment : '휴대폰번호 회사'
  })
  mobile_company : string;

  @Column({
    type : 'date',
    comment : '생년월일'
  })
  date_of_birth : Date;

  @Column({
    type : 'tinyint',
    comment : '성별',
    default : UserGender.male
  })
  gender : number;

  @Column({
    type : 'tinyint',
    comment : `정회원 / 준회원(beta)`,
    default : userType.use
  })
  type : number;

  @Column({
    type : 'boolean',
    comment : '',
    default : false
  })
  kakao_alert : boolean;

  @OneToMany(
    () => UserBusiness,
    user_businesses => user_businesses.user,
    CASCADE_OPTION
  )
  businesses : Array<UserBusiness>

  @OneToMany(
    () => UserDevice,
    user_devices => user_devices.user,
    CASCADE_OPTION,
  )
  devices : Array<UserDevice>;

  @OneToMany(
    () => Inquiry,
    user_inquiry => user_inquiry.user,
    CASCADE_OPTION
  )
  inquiries : Array<Inquiry>

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

  @Column({
    type : 'date',
    default: () => '(CURRENT_DATE)',
    comment : '최근 접속일 알기 위한 column'
  })
  refreshed_at : Date;

  @DeleteDateColumn({
    name : 'deleted_at',
    comment : '삭제일'
  })
  deleted_at : Date;

  @BeforeInsert()
  async setUserNum() : Promise<void> {
    if(this.type === 0) {
      this.user_num = this.id.substring(0 , 5);
    }
  }

  public getBusiness(business_id) : UserBusiness {
    try {
      const businesses : Array<UserBusiness> = this.businesses.filter(business => {
        if(business.id === business_id) {
          return business
        }
      })
      return businesses.length !== 0 ? businesses[0] : null;
    } catch(e) {
      return null;
    }
  }

  public findBusinessNum(businessNumber) : UserBusiness {
    try {
      const businesses : Array<UserBusiness> = this.businesses.filter(business => {
        if(business.business_number === businessNumber) {
          return business
        }
      })
      return businesses.length !== 0 ? businesses[0] : null;
    } catch(e) {
      return null;
    }
  }

  public getDevice(device_id) : UserDevice {
    try {
      const devices : Array<UserDevice> = this.devices.filter(business => {
        if(business.id === device_id) {
          return business
        }
      })
      return devices.length !== 0 ? devices[0] : null;
    } catch(e) {
      return null;
    }
  }
}