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
@Entity(name = SchemaNames.inquiries)
@Table(name = SchemaNames.inquiries)
public class Inquiry implements Serializable{
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
    name = "type",
    columnDefinition = "TINYINT default 0",
    nullable = false
  )
  private int type;

  @Column(
    name = "title",
    columnDefinition = "VARCHAR(255)",
    length = 255,
    nullable = false
  )
  private String title;

  @Column(
    name = "description",
    columnDefinition = "TEXT",
    nullable = false
  )
  private String description;

  @Column(
    name = "images",
    columnDefinition = "TEXT",
    nullable = true
  )
  private String images;

  @Column(
    name = "answer_title",
    columnDefinition = "VARCHAR(255)",
    length = 255,
    nullable = true
  )
  private String answer_title;

  @Column(
    name = "answer_description",
    columnDefinition = "TEXT",
    nullable = true
  )
  private String answer_description;

  @Column(
    name = "answer_admin",
    columnDefinition = "VARCHAR(30)",
    length = 30,
    nullable = true
  )
  private String answer_admin;

  @Column(
    name = "status",
    columnDefinition = "TINYINT",
    nullable = false
  )
  private int status;

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

  public Inquiry(
    UUID id,
    int type,
    String title,
    String description,
    String images,
    String answer_title,
    String answer_description,
    String answer_admin,
    int status,
    User user,
    Date created_at,
    Date updated_at,
    Date deleted_at
  ) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.description = description;
    this.images = images;
    this.answer_title = answer_title;
    this.answer_description = answer_description;
    this.answer_admin = answer_admin;
    this.status = status;
    this.user = user;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }
}
