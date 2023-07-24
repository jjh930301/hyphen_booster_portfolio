package com.booster.hyphen.nice.dto.auth;

import java.util.UUID;

import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenDto {
  @ApiModelProperty(value = "device primary key")
  private UUID id;
  @ApiModelProperty(value = "refresh_token")
  private String token;
}
