package com.booster.hyphen.nice.response;

import java.util.Date;
import java.util.List;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@ApiModel
public class UserResponseModel {
  @Getter
  @AllArgsConstructor
  @ApiModel
  private class UserModel {
    @ApiModelProperty(value = "id")
    private String id;

    @ApiModelProperty(value = "대표자명")
    private String name;

    @ApiModelProperty(value = "타입")
    private int type;

    @ApiModelProperty(value = "전화번호")
    private String mobile;

    @ApiModelProperty(value = "휴대폰번호 회사")
    private String mobile_company;

    @ApiModelProperty(value = "성별")
    private int gender;

    @ApiModelProperty(value = "생년월일")
    private String date_of_birth;

    @ApiModelProperty(value = "카카오 알림 on/off")
    private boolean kakao_alert;

    @Getter
    @AllArgsConstructor
    @ApiModel
    private class DeviceModel {
      @ApiModelProperty(value = "id")
      private String id;
      @ApiModelProperty(value = "vendor_id")
      private String vendor_id;
      @ApiModelProperty(value = "디바이스 이름")
      private String device_name;
      @ApiModelProperty(value = "fcm 토큰")
      private String token;
      @ApiModelProperty(value = "카드 승인 알림 on/off")
      private boolean card_sales_approval_alert;
      @ApiModelProperty(value = "현금 승인 알림 on/off")
      private boolean cash_sales_approval_alert;
      @ApiModelProperty(value = "카드 취소 알림 on/off")
      private boolean card_sales_cancel_alert;
      @ApiModelProperty(value = "현금 취소 알림 on/off")
      private boolean cash_sales_cancel_alert;
      @ApiModelProperty(value = "리포트 알림 on/off")
      private boolean report_alert;
    }
    @ApiModelProperty(value = "디바이스 리스트")
    private List<DeviceModel> devices;

    @Getter
    @AllArgsConstructor
    @ApiModel
    private class BusinessModel {
      @ApiModelProperty(value = "id")
      private String id;

      @ApiModelProperty(value = "사업자 번호")
      private String business_number;

      @ApiModelProperty(value = "사업장 이름")
      private String store_name;

      @ApiModelProperty(value = "여신 계정")
      private String crefia_id;

      @ApiModelProperty(value = "계정 상태")
      private boolean crefia_account;

      @ApiModelProperty(value = "여신 등록날짜")
      private Date crefia_updated_at;

      @ApiModelProperty(value = "홈택스 id")
      private String hometax_id;

      @ApiModelProperty(value = "계정 상태")
      private boolean hometax_account;

      @ApiModelProperty(value = "홈택스 등록일")
      private Date hometax_updated_at;

      @ApiModelProperty(value = "배민 계정")
      private String baemin_id;

      @ApiModelProperty(value = "계정 상태")
      private boolean baemin_account;

      @ApiModelProperty(value = "배민 등록날짜")
      private Date baemin_updated_at;

      @ApiModelProperty(value = "요기요 계정")
      private String yogiyo_id;

      @ApiModelProperty(value = "계정 상태")
      private boolean yogiyo_account;

      @ApiModelProperty(value = "요기요 등록날짜")
      private Date yogiyo_updated_at;

      @ApiModelProperty(value = "쿠팡이츠 계정")
      private String coupange_id;

      @ApiModelProperty(value = "계정 상태")
      private boolean coupange_account;

      @ApiModelProperty(value = "1")
      private int is_ksnet;

      @ApiModelProperty(value = "1")
      private int is_paid;

      @ApiModelProperty(value = "쿠팡이츠 등록날짜")
      private Date coupange_updated_at;
      @ApiModelProperty(value = "사업자 번호 유형 none / ksnet / crefia / other")
      private int type;
    }
    @ApiModelProperty(value = "사업자 번호 리스트")
    private List<BusinessModel> businesses;
  }
  @ApiModelProperty(value = "user")
  private UserModel user;

  @ApiModelProperty(value = "token")
  private String access_token;

  @ApiModelProperty(value = "refresh_token")
  private String refresh_token;
}
