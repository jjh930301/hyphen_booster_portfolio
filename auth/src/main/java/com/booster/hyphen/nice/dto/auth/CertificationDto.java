package com.booster.hyphen.nice.dto.auth;

import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CertificationDto {
  @ApiModelProperty(value = "인증번호")
  private String auth_no;
  @ApiModelProperty(value = "응답 고유번호")
  private String res_code;
}
