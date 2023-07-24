import { COLLATION, Database } from "src/constants/database";
import { SchemaNames } from "src/constants/schema.names";
import { Column, Entity } from "typeorm"

@Entity({
  name : SchemaNames.ksta_card,
  database : Database.INTERPOS,
  synchronize : false
})
export class KstaCard {

  @Column({
    type : 'varchar',
    collation : COLLATION,
    primary : true,
    length : 50
  })
  pg_deal_inhe_numb : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : false,
    length : 50
  })
  user_id : string;

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  oil_tax_free_card_name: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  allo_mont_numb: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  busi_sele: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  sim_stml_nm: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  appr_numb: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  card_numb: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  make_comp_gove_code: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  canc_yn: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  card_sele_name: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  devi_numb: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  purc_comp_gove_code: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  serv_rate: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  canc_gove_time: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  make_comp_gove_name: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  real_deal_time: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  canc_gove_date: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  devi_netw_sele_name: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  deal_gove_time: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  purc_comp_gran_memb_id: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  msk_card_numb: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  appr_canc_sele_name: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  std_resp_code_mesg: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  hdw_cer_inf: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  key_entry_mode_name: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  cust_numb: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  purc_comp_gove_name: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  oil_tax_free: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  tax: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  deal_gove_date: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  mess_type: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  purc_sele: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  ori_deal_date: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  resp_code_host_recv_mesg: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  van_memb_numb: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  gove_sele_rejt_mesg: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  appr_repu_mone: string

  @Column({
    type : 'varchar',
    collation : COLLATION,
    nullable : true,
    length : 50
  })
  orde_numb: string;
}