package com.booster.hyphen.nice.entities;

import java.util.List;
import java.io.Serializable;
import java.util.Date;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.PrePersist;
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
import net.bytebuddy.utility.RandomString;

@Getter
@Setter
@Builder
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor
@TypeDef(name = "json", typeClass = JsonStringType.class)
@Entity(name = SchemaNames.users)
@Table(name = SchemaNames.users)
public class User implements Serializable{
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
    name = "client_id",
    columnDefinition = "VARCHAR(255)",
    length = 255,
    unique = true
  )
  private String client_id;

  @Column(
    name = "di",
    columnDefinition = "VARCHAR(255)",
    length = 255,
    unique = true
  )
  private String di;

  @Column(
    name = "user_num",
    columnDefinition = "VARCHAR(15)"
  )
  private String user_num;
  
  @Column(
    name = "name",
    columnDefinition = "VARCHAR(30)",
    length = 30,
    nullable = false
  )
  private String name;
  
  @Column(
    name = "mobile",
    columnDefinition = "VARCHAR(30)",
    length = 30,
    nullable = false
  )
  private String mobile;

  @Column(
    name = "mobile_company",
    columnDefinition = "VARCHAR(1)",
    length = 1,
    nullable = false
  )
  private String mobile_company;
  
  @Column(
    name = "date_of_birth",
    columnDefinition = "DATE",
    length = 30,
    nullable = false
  )
  private Date date_of_birth;
  
  @Column(
    name = "gender",
    columnDefinition = "TINYINT default 0",
    nullable = false
  )
  private int gender;
  
  @Column(
    name = "type",
    columnDefinition = "TINYINT default 0",
    nullable = false
  )
  private int type;

  @Column(
    name = "kakao_alert",
    columnDefinition = "BOOLEAN default false",
    nullable = false
  )
  private boolean kakao_alert;
  
  @OneToMany(
    fetch = FetchType.LAZY,
    mappedBy = "user",
    cascade = CascadeType.ALL,
    targetEntity = Business.class
  )
  @JsonIgnore
  @OrderBy("created_at ASC")
  private List<Business> businesses;
  
  @OneToMany(
    fetch = FetchType.LAZY,
    mappedBy = "user",
    cascade = CascadeType.ALL,
    targetEntity = Device.class
  )
  @JsonIgnore
  @OrderBy("created_at ASC")
  private List<Device> devices;
  
  @OneToMany(
    fetch = FetchType.LAZY,
    mappedBy = "user",
    cascade = CascadeType.ALL,
    targetEntity = Inquiry.class
  )
  @JsonIgnore
  private List<Inquiry> inquiries;

  @OneToMany(
    fetch = FetchType.LAZY,
    mappedBy = "user",
    cascade = CascadeType.ALL,
    targetEntity = Report.class
  )
  @JsonIgnore
  private List<Report> reports;
  
  @Column(
    name = "created_at"
    // columnDefinition = "DEFAULT CURRENT_TIMESTAMP(6) DEFAULT_GENERATED"
  )
  @CreatedDate
  private Date created_at;

  @Column(
    name = "updated_at"
    // columnDefinition = "DEFAULT CURRENT_TIMESTAMP(6) DEFAULT_GENERATED ON UPDATE CURRENT_TIMESTAMP"
  )
  @CreatedDate
  @LastModifiedDate
  private Date updated_at;

  @Column(
    name = "refreshed_at",
    columnDefinition = "DATE DEFAULT (CURRENT_DATE)"
  )
  private Date refreshed_at;

  @Column(
    name = "deleted_at",
    nullable = true
  )
  private Date deleted_at;

  public User(
    UUID id,
    String client_id,
    String di,
    String user_num,
    String name,
    String mobile,
    String mobile_company,
    Date date_of_birth,
    int gender,
    int type,
    boolean kakao_alert,
    List<Business> businesses,
    List<Device> devices,
    List<Inquiry> inquiries,
    List<Report> reports,
    Date created_at,
    Date updated_at,
    Date refreshed_at,
    Date deleted_at
  ) {
    this.id = id;
    this.client_id = client_id;
    this.di = di;
    this.user_num = user_num;
    this.name = name;
    this.mobile = mobile;
    this.mobile_company = mobile_company;
    this.date_of_birth = date_of_birth;
    this.gender = gender;
    this.type = type;
    this.kakao_alert = kakao_alert;
    this.businesses = businesses;
    this.devices = devices;
    this.inquiries = inquiries;
    this.reports = reports;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.refreshed_at = refreshed_at;
    this.deleted_at = deleted_at;
  }

  @PrePersist()
  public void setUserNum() {
    System.out.println(this.type);
    //일반 유저일 경우
    this.user_num = "MU-" + RandomString.make(6);
  }
  
}
