package com.booster.hyphen.nice.entities;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import com.booster.hyphen.nice.constants.SchemaNames;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vladmihalcea.hibernate.type.json.JsonStringType;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor
@TypeDef(name = "json", typeClass = JsonStringType.class)
@Entity(name = SchemaNames.user_businesses)
@Table(name = SchemaNames.user_businesses)
public class Business implements Serializable{
  @Id
  @GeneratedValue(generator = "UUID")
  @ColumnDefault("random_uuid()")
  @GenericGenerator(
    name = "UUID", 
    strategy = "org.hibernate.id.UUIDGenerator"
  )
  @Column(
    name = "id",
    updatable = false,
    nullable = false,
    columnDefinition = "VARCHAR(36)"
  )
  @Type(type = "uuid-char")
  private UUID id;

  @Column(
    name = "business_number",
    columnDefinition = "VARCHAR(40)",
    length = 40,
    nullable = false
  )
  private String business_number;

  @Column(
    name = "member_group_id",
    columnDefinition = "VARCHAR(20)",
    length = 20,
    nullable = true
  )
  private String member_group_id;

  @Column(
    name = "store_name",
    columnDefinition = "VARCHAR(255)",
    length = 255,
    nullable = true
  )
  private String store_name;

  @Column(
    name = "address",
    columnDefinition = "VARCHAR(255) default null",
    nullable = true
  )
  private String address;

  @Column(
    name = "sector",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String sector;

  @Column(
    name = "status",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String status;

  @Column(
    name = "crefia_id",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String crefia_id;

  @Column(
    name = "crefia_password",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String crefia_password;

  @Column(
    name = "crefia_updated_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date crefia_updated_at;

  @Column(
    name = "crefia_recented_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date crefia_recented_at;

  @Column(
    name = "hometax_id",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String hometax_id;

  @Column(
    name = "hometax_password",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String hometax_password;

  @Column(
    name = "hometax_updated_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date hometax_updated_at;

  @Column(
    name = "hometax_recented_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date hometax_recented_at;

  @Column(
    name = "cert",
    columnDefinition = "TEXT default null",
    nullable = true
  )
  private String cert;

  @Column(
    name = "pri",
    columnDefinition = "TEXT default null",
    nullable = true
  )
  private String pri;

  @Column(
    name = "cert_password",
    columnDefinition = "TEXT default null",
    nullable = true
  )
  private String cert_password;

  @Column(
    name = "cret_updated_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date cret_updated_at;

  @Column(
    name = "cert_number",
    columnDefinition = "varchar(255)",
    nullable = true
  )
  private String cert_number;

  @Column(
    name = "baemin_id",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String baemin_id;

  @Column(
    name = "baemin_password",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String baemin_password;

  @Column(
    name = "baemin_store_id",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String baemin_store_id;

  @Column(
    name = "baemin_updated_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date baemin_updated_at;

  @Column(
    name = "baemin_recented_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date baemin_recented_at;

  @Column(
    name = "yogiyo_id",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String yogiyo_id;

  @Column(
    name = "yogiyo_password",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String yogiyo_password;

  @Column(
    name = "yogiyo_store_id",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String yogiyo_store_id;

  @Column(
    name = "yogiyo_updated_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date yogiyo_updated_at;
  
  @Column(
    name = "yogiyo_recented_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date yogiyo_recented_at;

  @Column(
    name = "coupange_id",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String coupange_id;

  @Column(
    name = "coupange_password",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String coupange_password;

  @Column(
    name = "coupange_store_id",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String coupange_store_id;

  @Column(
    name = "coupange_updated_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date coupange_updated_at;

  @Column(
    name = "coupange_recented_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date coupange_recented_at;

  @Column(
    name = "type",
    columnDefinition = "TINYINT",
    nullable = false
  )
  private int type;

  @Column(
    name = "tax_type",
    columnDefinition = "TINYINT"
  )
  private int tax_type;

  @OneToMany(
    fetch = FetchType.LAZY,
    mappedBy = "business", 
    cascade = CascadeType.ALL,
    targetEntity = Alert.class
  )
  @JsonIgnore
  private List<Alert> alerts;

  @ManyToOne(
    fetch = FetchType.LAZY,
    optional = false
  )
  @JsonIgnore
  @JoinColumn(
    name = "user"
  )
  private User user;

  @Column(
    name = "is_ksnet",
    columnDefinition = "TINYINT default 0"
  )
  private int is_ksnet;

  @Column(
    name = "is_paid",
    columnDefinition = "TINYINT default 0"
  )
  private int is_paid;

  @Column(
    name = "agreemented_at",
    columnDefinition = "DATETIME default null",
    nullable = true
  )
  private Date agreemented_at;

  @Column(
    name = "opened_at",
    columnDefinition = "DATE default null",
    nullable = true
  )
  private Date opened_at;

  @Column(name = "created_at")
  @CreatedDate
  private Date created_at;

  @Column(name = "updated_at")
  @CreatedDate
  @LastModifiedDate
  private Date updated_at;

  @Column(
    name = "deleted_at",
    nullable = true
  )
  private Date deleted_at;

  public Business(
    UUID id,
    String business_number,
    String member_group_id,
    String store_name,
    String address,
    String sector,
    String status,
    String crefia_id,
    String crefia_password,
    Date crefia_updated_at,
    Date crefia_recented_at,
    String hometax_id,
    String hometax_password,
    Date hometax_updated_at,
    Date hometax_recented_at,
    String cert,
    String pri,
    String cert_password,
    Date cret_updated_at,
    String cert_number,
    String baemin_id,
    String baemin_password,
    String baemin_store_id,
    Date baemin_updated_at,
    Date baemin_recented_at,
    String yogiyo_id,
    String yogiyo_password,
    String yogiyo_store_id,
    Date yogiyo_updated_at,
    Date yogiyo_recented_at,
    String coupange_id,
    String coupange_password,
    String coupange_store_id,
    Date coupange_updated_at,
    Date coupange_recented_at,
    int type,
    int tax_type,
    List<Alert> alerts,
    User user,
    int is_ksnet,
    int is_paid,
    Date agreemented_at,
    Date opened_at,
    Date created_at,
    Date updated_at,
    Date deleted_at
  ) {
    this.id = id;
    this.business_number = business_number;
    this.member_group_id = member_group_id;
    this.store_name = store_name;
    this.address = address;
    this.sector = sector;
    this.status = status;
    this.crefia_id = crefia_id;
    this.crefia_password = crefia_password;
    this.crefia_updated_at = crefia_updated_at;
    this.crefia_recented_at = crefia_recented_at;
    this.hometax_id = hometax_id;
    this.hometax_password = hometax_password;
    this.hometax_updated_at = hometax_updated_at;
    this.hometax_recented_at = hometax_recented_at;
    this.cert = cert;
    this.pri = pri;
    this.cert_password = cert_password;
    this.cret_updated_at = cret_updated_at;
    this.cert_number = cert_number;
    this.baemin_id = baemin_id;
    this.baemin_password = baemin_password;
    this.baemin_store_id = baemin_store_id;
    this.baemin_updated_at = baemin_updated_at;
    this.baemin_recented_at = baemin_recented_at;
    this.yogiyo_id = yogiyo_id;
    this.yogiyo_password = yogiyo_password;
    this.yogiyo_store_id = yogiyo_store_id;
    this.yogiyo_updated_at = yogiyo_updated_at;
    this.yogiyo_recented_at = yogiyo_recented_at;
    this.coupange_id = coupange_id;
    this.coupange_password = coupange_password;
    this.coupange_store_id = coupange_store_id;
    this.coupange_updated_at = coupange_updated_at;
    this.coupange_recented_at = coupange_recented_at;
    this.type = type;
    this.tax_type = tax_type;
    this.alerts = alerts;
    this.user = user;
    this.is_ksnet = is_ksnet;
    this.is_paid = is_paid;
    this.agreemented_at = agreemented_at;
    this.opened_at = opened_at;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }
}
