package com.booster.hyphen.nice.models;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class KakaoUserInfo {
  Long id;
  String email;
  String nickname;
  String ci;
  String name;
}
