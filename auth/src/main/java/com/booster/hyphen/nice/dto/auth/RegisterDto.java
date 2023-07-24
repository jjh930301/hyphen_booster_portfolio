package com.booster.hyphen.nice.dto.auth;

import java.util.Date;

import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterDto {
  @ApiModelProperty(value = "인증번호")
  private String auth_no;
  @ApiModelProperty(value = "응답 고유번호")
  private String res_code;
  @ApiModelProperty(value = "이름")
  private String name;
  // @ApiModelProperty(value = "사업자 번호" , example = "\"7160301518\"")
  // private String business_number;
  @ApiModelProperty(value = "성별")
  private int gender;
  // @ApiModelProperty(value = "유저 타입")
  // private int type;
  @ApiModelProperty(value = "전화번호")
  private String mobile;
  @ApiModelProperty(value = "전화번호 회사")
  private String mobile_co;
  @ApiModelProperty(value = "생년월일" , example = "1993-03-01")
  private Date date_of_birth;
  @ApiModelProperty(value = "디바이스 클라이언트 고유 값 (웹인 경우 null)")
  private String device_id;
  @ApiModelProperty(value = "디바이스 이름 (웹인 경우 web으로)")
  private String device_name;
  @ApiModelProperty(value = "vendor_id")
  private String vendor_id;
  @ApiModelProperty(value = "fcm token")
  private String token;
  @ApiModelProperty(value = "0 : ios / 1 : aos / 2 : web")
  private int operating_system;
  
}
