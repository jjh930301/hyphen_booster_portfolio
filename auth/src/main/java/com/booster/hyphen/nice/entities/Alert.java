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
@Entity(name = SchemaNames.alerts)
@Table(name = SchemaNames.alerts)
public class Alert implements Serializable{
  @Id
  @GeneratedValue(generator = "uuid2")
  @GenericGenerator(name = "uuid2", strategy = "uuid2")
  @Column(
    name = "id",
    updatable = false,
    nullable = false,
    columnDefinition = "VARCHAR(36)"
  )
  @Type(type = "uuid-char")
  private UUID id;

  @Column(
    name = "title",
    columnDefinition = "VARCHAR(100)",
    nullable = false
  )
  private String title;

  @Column(
    name = "body",
    columnDefinition = "VARCHAR(255)",
    nullable = false
  )
  private String body;

  @Column(
    name = "event",
    columnDefinition = "TEXT",
    nullable = false
  )
  private String event;

  @Column(
    name = "event_type",
    columnDefinition = "TINYINT",
    nullable = false
  )
  private int event_type;

  @Column(
    name = "is_public",
    columnDefinition = "BOOLEAN default false",
    nullable = false
  )
  private boolean is_public;

  @Column(
    name = "is_read",
    columnDefinition = "BOOLEAN default false",
    nullable = false
  )
  private boolean is_read;

  @ManyToOne(
    fetch = FetchType.LAZY,
    optional = false
  )
  @JsonIgnore
  @JoinColumn(
    name = "business"
  )
  private Business business;

  @Column(name = "created_at")
  @CreatedDate
  private Date created_at;

  @Column(name = "updated_at")
  private Date updated_at;

  @Column(
    name = "deleted_at",
    nullable = true
  )
  @CreatedDate
  @LastModifiedDate
  private Date deleted_at;

  public Alert(
    UUID id,
    String title,
    String body,
    String event,
    int event_type,
    boolean is_public,
    boolean is_read,
    Business business,
    Date created_at,
    Date updated_at,
    Date deleted_at
  ) {
    this.id = id;
    this.title = title;
    this.body = body;
    this.event = event;
    this.is_public = is_public;
    this.event_type = event_type;
    this.is_read = is_read;
    this.business = business;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }
}
