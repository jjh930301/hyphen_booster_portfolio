import { CASCADE_OPTION, CHILD_CASCADE_OPTION, COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { UserBusiness } from "../user/user.business.entity";

@Entity({
  name : SchemaNames.hometax_taxes,
  database : Database.BOOSTER
})
export class HometaxTax {

  @ManyToOne(
    () => UserBusiness,
    business => business.hometax_taxes,
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
    primary : true,
  })
  business : UserBusiness;

  @Column({
    type : 'tinyint',
    primary : true,
    comment : '매입 매출 구분 01 : 매출 / 02 : 매입 supByr'
  })
  division : number;

  @Column({
    type : 'date',
    primary : true,
    comment : '작성일자 makeDt'
  })
  make_date : Date;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    primary : true,
    comment : '승인번호 issueNo'
  })
  issue_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    primary : true,
    comment : '출력용 승인번호 issueNoDisp'
  })
  issue_display_no : string;

  @Column({
    type : 'date',
    primary : true,
    comment : '발급일자 issueDt'
  })
  issue_date : Date;

  @Column({
    type : 'date',
    primary : true,
    comment : '전송일자 sendDt'
  })
  send_date : Date;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '공급자등록번호 supBizNo'
  })
  supplier_business_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '종사업자번호 supBizSubNo'
  })
  supplier_sub_business_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '상호 supCorpNm'
  })
  supplier_company_name : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '대표자명 supRepNm'
  })
  supplier_ceo_name: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 200,
    nullable : true,
    default : null,
    comment : '주소 supAddress'
  })
  supplier_address: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '공급받는자 등록번호 byrBizNo'
  })
  buyer_business_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '종사업자번호 byrBizSubNo'
  })
  buyer_sub_business_no : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 150,
    nullable : true,
    default : null,
    comment : '상호 byrCorpNm'
  })
  buyer_company_name: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '대표자명 byrRepNm'
  })
  buyer_ceo_name: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 200,
    nullable : true,
    default : null,
    comment : '주소 byrAddress'
  })
  buyer_address: string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '합계금액 totAmt'
  })
  total_amount: number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '공급금액 supAmt'
  })
  supply_amount: number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '세액 taxAmt'
  })
  tax_amount: number;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '세금계산서 분류 taxClsf'
  })
  tax_classification : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '세금계산서 종류 taxKnd'
  })
  tax_kind : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '발급유형 isnType'
  })
  issue_type : string;

  @Column({
    type : 'text',
    collation : COLLATION,
    nullable : true,
    default : null,
    comment : '비고 bigo'
  })
  note : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 30,
    nullable : true,
    default : null,
    comment : '영수청구 구분 demandGb'
  })
  receipt_division : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 200,
    nullable : true,
    default : null,
    comment : '공급자 이메일 supEmail'
  })
  supplier_email : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 200,
    nullable : true,
    default : null,
    comment : '공급받는자 이메일1 byrEmail1'
  })
  buyer_first_email : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 200,
    nullable : true,
    default : null,
    comment : '공급받는자 이메일2 byrEmail2'
  })
  buyer_second_email: string;

  @Column({
    type : 'date',
    nullable : true,
    default : null,
    comment : '품목일자 itemDt'
  })
  item_date: Date;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    default : null,
    comment : '품목명 itemNm'
  })
  item_name: string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    length : 100,
    nullable : true,
    default : null,
    comment : '품목규격 itemStd'
  })
  item_standard: string;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '품목수량 itemQty'
  })
  item_quantity: number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '품목단가 itemUnt'
  })
  item_price: number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '품목공급가액 itemSupAmt'
  })
  item_supply_amount : number;

  @Column({
    type : 'decimal',
    precision : 10,
    scale : 0,
    default : 0,
    nullable : true,
    comment : '품목세액 itemTaxAmt'
  })
  item_tax_amount : number;

  @Column({
    type : 'text',
    collation : COLLATION,
    nullable : true,
    default : null,
    comment : '품목비고 itemBigo'
  })
  item_note : string;
}