package com.booster.hyphen.nice.utils;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.booster.hyphen.nice.models.KakaoUserInfo;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

@Component
public class KakaoOAuth {
  public KakaoUserInfo getUserInfo(String code) {
    // 1. 인가코드 -> 액세스 토큰
    String accessToken = getAccessToken(code);
    // 2. 액세스 토큰 -> 카카오 사용자 정보
    KakaoUserInfo userInfo = getUserInfoByToken(accessToken);

    return userInfo;
  }

  private String getAccessToken(String authorizedCode) {
    // HttpHeader 오브젝트 생성
    HttpHeaders headers = new HttpHeaders();
    headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
    String restKey = System.getenv("KAKAO_REST_API_KEY");
    // HttpBody 오브젝트 생성
    MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
    params.add("grant_type", "authorization_code");
    params.add("client_id", restKey);
    params.add("redirect_uri", "https://kubooster.hyphen.im/auth/kakao/token");
    params.add("code", authorizedCode);

    // HttpHeader와 HttpBody를 하나의 오브젝트에 담기
    RestTemplate rt = new RestTemplate();
    HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(params, headers);

    // Http 요청하기 - Post방식으로 - 그리고 response 변수의 응답 받음.
    ResponseEntity<String> response = rt.exchange(
      "https://kauth.kakao.com/oauth/token",
      HttpMethod.POST,
      kakaoTokenRequest,
      String.class
    );

    // JSON -> 액세스 토큰 파싱
    String tokenJson = response.getBody();
    System.out.println(tokenJson);
    JsonParser parser = new JsonParser();
    JsonElement element = parser.parse(tokenJson);
    JsonObject json = element.getAsJsonObject();
    String accessToken = json.get("access_token").getAsString();

    return accessToken;
  }

  private KakaoUserInfo getUserInfoByToken(String accessToken) {
    // HttpHeader 오브젝트 생성
    HttpHeaders headers = new HttpHeaders();
    headers.add("Authorization", "Bearer " + accessToken);
    headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

    // HttpHeader와 HttpBody를 하나의 오브젝트에 담기
    RestTemplate rt = new RestTemplate();
    HttpEntity<MultiValueMap<String, String>> kakaoProfileRequest = new HttpEntity<>(headers);

    // Http 요청하기 - Post방식으로 - 그리고 response 변수의 응답 받음.
    ResponseEntity<String> response = rt.exchange(
            "https://kapi.kakao.com/v2/user/me",
            HttpMethod.POST,
            kakaoProfileRequest,
            String.class
    );

    JsonParser parser = new JsonParser();
    JsonElement element = parser.parse(response.getBody());
    System.out.println("body::::::"+response.getBody());
    JsonObject json = element.getAsJsonObject();
    Long id = json.get("id").getAsLong();//getLong("id");
    String email = json.getAsJsonObject("kakao_account")
      .get("email")
      .getAsString();
    String nickname = json.getAsJsonObject("properties")
      .get("nickname")
      .getAsString();
    String ci = json.getAsJsonObject("properties")
      .get("ci")
      .getAsString();
    String name = json.getAsJsonObject("properties")
      .get("name")
      .getAsString();

    return new KakaoUserInfo(id, email, nickname , ci , name);
  }
}
