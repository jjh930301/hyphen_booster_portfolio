package com.booster.hyphen.nice.dto.auth;

import java.util.UUID;

import io.swagger.annotations.ApiModelProperty;
import lombok.Setter;
import lombok.Getter;

@Getter
@Setter
public class TokenRefreshDto {
  @ApiModelProperty(value = "id")
  private UUID id;
}
