package com.booster.hyphen.nice.entities;

import java.io.Serializable;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import com.booster.hyphen.nice.constants.SchemaNames;
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
@Entity(name = SchemaNames.holiday)
@Table(name = SchemaNames.holiday)
public class Holiday implements Serializable{
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
    name = "unique",
    nullable = false,
    columnDefinition = "VARCHAR(60)",
    unique = true
  )
  private String unique;

  @Column(
    name = "date_kind",
    columnDefinition = "VARCHAR(10)",
    length = 10,
    nullable = false
  )
  private String date_kind;

  @Column(
    name = "date_name",
    columnDefinition = "VARCHAR(30)",
    length = 30,
    nullable = false
  )
  private String date_name;

  @Column(
    name = "is_holiday",
    columnDefinition = "BOOLEAN",
    nullable = false
  )
  private boolean is_holiday;

  @Column(
    name = "locdate",
    columnDefinition = "DATETIME",
    nullable = false
  )
  private String locdate;

  public Holiday(
    UUID id,
    String unique,
    String date_kind,
    String date_name,
    boolean is_holiday,
    String locdate
  ) {
    this.id = id;
    this.unique = unique;
    this.date_kind = date_kind;
    this.date_name = date_name;
    this.is_holiday = is_holiday;
    this.locdate = locdate;
  }
}
