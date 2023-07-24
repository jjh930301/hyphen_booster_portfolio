package com.booster.hyphen.nice.dto.auth;

import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserInfoDto {
  @ApiModelProperty(value = "주민번호 앞 일곱자리")
  private String jumin;
  @ApiModelProperty(value = "이름")
  private String name;
  @ApiModelProperty(value = "(SKT : 1 / KT : 2 / LG : 3 / SKT알뜰 : 5 / KT알뜰 : 6 / LGU+알뜰 : 7)")
  private String mobile_co;
  @ApiModelProperty(value = "전화번호")
  private String mobile_no;
}
