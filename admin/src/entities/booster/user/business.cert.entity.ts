import { CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { UserBusiness } from "./user.business.entity";

@Entity({
  name : SchemaNames.business_cert,
  database : Database.BOOSTER,
})
@Index([
  'business',
  'cert_number'
])
export class BusinessCert {

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
    length : 255,
    collation : COLLATION,
    primary : true,
    comment : '인증서 번호',
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
    length : 255,
    collation : COLLATION,
    default : null,
    nullable : true,
    comment : '인증서 발급자'
  })
  cert_issuer : string;

  @Column({
    type : 'date',
    default : null,
    nullable : true,
    comment : '인증서 만료일'
  })
  cert_expiration : Date;

  @Column({
    type : 'varchar',
    length : 255,
    collation : COLLATION,
    default : null,
    nullable : true,
    comment : '발급자 , 타입 , 법인 , 개인'
  })
  oid : string;

  @Column({
    type : 'datetime',
    default : null,
    nullable : true
  })
  cret_updated_at : Date;
}