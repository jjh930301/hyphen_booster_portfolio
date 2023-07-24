package com.booster.hyphen.nice.response;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@ApiModel
public class PasswordResponseModel {
  @ApiModelProperty(value = "result")
  private String result;
}
