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
@Entity(name = SchemaNames.user_reports)
@Table(name = SchemaNames.user_reports)
public class Report implements Serializable{

  @Id
  @GeneratedValue(generator = "uuid2")
  @GenericGenerator(name = "uuid2" , strategy = "uuid2")
  @Column(
    name = "id",
    updatable = false,
    nullable = false,
    columnDefinition = "VARCHAR(36)"
  )
  @Type(type = "uuid-char")
  private UUID id;

  @Column(
    name = "type",
    columnDefinition = "TINYINT",
    nullable = false
  )
  private int type;

  @Column(
    name = "sales",
    nullable = false
  )
  private long sales;

  @Column(
    name = "expenditure",
    nullable = false
  )
  private long expenditure;

  @Column(
    name = "deposit",
    nullable = false
  )
  private long deposit;

  @Column(
    name = "date",
    length = 25,
    nullable = false
  )
  private String date;

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

  public Report(
    UUID id,
    int type,
    long sales,
    long expenditure,
    long deposit,
    String date,
    User user,
    Date created_at,
    Date updated_at,
    Date deleted_at
  ) {
    this.id = id;
    this.type = type;
    this.sales = sales;
    this.expenditure = expenditure;
    this.deposit = deposit;
    this.date = date;
    this.user = user;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }
}
