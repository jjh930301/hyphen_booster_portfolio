package com.booster.hyphen.nice.entities;

import java.io.Serializable;
import java.util.Date;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
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
@Entity(name = SchemaNames.user_devices)
@Table(name = SchemaNames.user_devices)
public class Device implements Serializable {
  @Id
  @GeneratedValue(generator = "UUID")
  @GenericGenerator(
    name = "UUID", 
    strategy = "org.hibernate.id.UUIDGenerator"
  )
  @ColumnDefault("random_uuid()")
  @Column(
    name = "id",
    updatable = false,
    nullable = false,
    columnDefinition = "VARCHAR(36)"
  )
  @Type(type = "uuid-char")
  private UUID id;

  @Column(
    name = "password",
    columnDefinition = "VARCHAR(100) default null",
    nullable = true
  )
  private String password;

  @Column(
    name = "fail_count",
    columnDefinition = "TINYINT default 0",
    nullable = true
  )
  private int fail_count;

  @Column(
    name = "vendor_id",
    columnDefinition = "VARCHAR(100)",
    nullable = true
  )
  private String vendor_id;

  @Column(
    name = "device_name",
    columnDefinition = "VARCHAR(50)"
  )
  private String device_name;

  @Column(
    name = "token",
    columnDefinition = "VARCHAR(255)",
    nullable = true
  )
  private String token;

  @Column(
    name = "refresh_token",
    columnDefinition = "VARCHAR(300)",
    nullable = true
  )
  private String refresh_token;

  @Column(
    name = "card_sales_approval_alert",
    columnDefinition = "BOOLEAN default false",
    nullable = false
  )
  private boolean card_sales_approval_alert;

  @Column(
    name = "cash_sales_approval_alert",
    columnDefinition = "BOOLEAN default false",
    nullable = false
  )
  private boolean cash_sales_approval_alert;

  @Column(
    name = "card_sales_cancel_alert",
    columnDefinition = "BOOLEAN default true",
    nullable = false
  )
  private boolean card_sales_cancel_alert;

  @Column(
    name = "cash_sales_cancel_alert",
    columnDefinition = "BOOLEAN default true",
    nullable = false
  )
  private boolean cash_sales_cancel_alert;

  @Column(
    name = "report_alert",
    columnDefinition = "BOOLEAN default true",
    nullable = false
  )
  private boolean report_alert;

  @Column(
    name = "unpaid_unpurchase_alert",
    columnDefinition = "BOOLEAN default true",
    nullable = false
  )
  private boolean unpaid_unpurchase_alert;

  @Column(
    name = "operating_system",
    columnDefinition = "TINYINT default 0",
    nullable = false
  )
  private int operating_system;

  @ManyToOne(
    fetch = FetchType.LAZY,
    optional = false
  )
  @JsonIgnore
  @JoinColumn(
    name = "user"
  )
  private User user;

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

  public Device(
    UUID id,
    String password,
    int fail_count,
    String vendor_id,
    String device_name,
    String token,
    String refresh_token,
    boolean card_sales_approval_alert,
    boolean cash_sales_approval_alert,
    boolean card_sales_cancel_alert,
    boolean cash_sales_cancel_alert,
    boolean report_alert,
    boolean unpaid_unpurchase_alert,
    int operating_system,
    User user,
    Date created_at,
    Date updated_at,
    Date deleted_at
  ) {
    this.id = id;
    this.password = password;
    this.fail_count = fail_count;
    this.vendor_id = vendor_id;
    this.device_name = device_name;
    this.token = token;
    this.refresh_token = refresh_token;
    this.card_sales_approval_alert = card_sales_approval_alert;
    this.cash_sales_approval_alert = cash_sales_approval_alert;
    this.card_sales_cancel_alert = card_sales_cancel_alert;
    this.cash_sales_cancel_alert = cash_sales_cancel_alert;
    this.report_alert = report_alert;
    this.unpaid_unpurchase_alert = unpaid_unpurchase_alert;
    this.operating_system = operating_system;
    this.user = user;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }

  public void addProperty(String string, String string2) {
  }
}
