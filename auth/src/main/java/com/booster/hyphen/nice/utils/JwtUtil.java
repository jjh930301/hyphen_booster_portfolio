package com.booster.hyphen.nice.utils;

import java.io.UnsupportedEncodingException;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.booster.hyphen.nice.enums.OperatingSystemType;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;

public class JwtUtil{

  public String createAccessToken(
    String id,
    String unique,
    int token_type
  ) throws Exception {
    SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;
    Date expireTime  = new Date();
    
    expireTime.setTime(expireTime.getTime() + 1000 * 3600 * 24); // (수정) 배포시 만료시간 30분

    String secretKeyEncodeBase64 = Encoders.BASE64.encode(System.getenv("JWT_SECRET").getBytes());
    byte[] keyBytes = Decoders.BASE64.decode(secretKeyEncodeBase64);
    Key key = Keys.hmacShaKeyFor(keyBytes);

    Map<String, Object> map = new HashMap<String, Object>();

    map.put("id", id);
    map.put("unique", unique);
    map.put("token_type", token_type);

    JwtBuilder builder = Jwts.builder()
      .setClaims(map);
    //테스트 계정은 access_token 만료가 없음
    if(token_type != 100) {
      builder.setExpiration(expireTime);
    }

    builder
      .setIssuer("hyphen-booster")
      .signWith(key, signatureAlgorithm);

    return builder.compact();
  }

  public String refreshToken(
    String id,
    String unique,
    int type
  ) {
    SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;
    Date expireTime  = new Date();
    expireTime.setTime(expireTime.getTime() + 1000 * 3600 * 24 * 14); // 14일간

    String secretKeyEncodeBase64 = Encoders.BASE64.encode(System.getenv("REFRESH_SECRET").getBytes());
    byte[] keyBytes = Decoders.BASE64.decode(secretKeyEncodeBase64);
    Key key = Keys.hmacShaKeyFor(keyBytes);

    Map<String, Object> map = new HashMap<String, Object>();

    map.put("id", id);
    map.put("unique", unique);

    JwtBuilder builder = Jwts.builder()
      .setClaims(map);
    //web일 경우 exprie time 설정
    if(type == OperatingSystemType.web.ordinal()) {
      builder.setExpiration(expireTime);
    }
    builder
    .setIssuer("hyphen-booster")
    .signWith(key, signatureAlgorithm);

    return builder.compact();
  }

  public Map<String, Object> verifyJWT(String jwt) throws UnsupportedEncodingException {
    String secretKeyEncodeBase64 = Encoders.BASE64.encode(System.getenv("REFRESH_SECRET").getBytes());
    byte[] keyBytes = Decoders.BASE64.decode(secretKeyEncodeBase64);
    Key key = Keys.hmacShaKeyFor(keyBytes);
    Map<String, Object> claimMap = null;
    try {
        Claims claims = Jwts
                .parser()
                .setSigningKey(key) // Set Key
                .parseClaimsJws(jwt) // 파싱 및 검증, 실패 시 에러
                .getBody();

        claimMap = claims;

    } catch (ExpiredJwtException e) { // 토큰이 만료되었을 경우
        return null;
    } catch (Exception e) { // 그외 에러났을 경우
        return null;
    }
    return claimMap;
  }   

  public Map<String, Object> verifyAccessToken(String jwt) throws UnsupportedEncodingException {
    String secretKeyEncodeBase64 = Encoders.BASE64.encode(System.getenv("JWT_SECRET").getBytes());
    byte[] keyBytes = Decoders.BASE64.decode(secretKeyEncodeBase64);
    Key key = Keys.hmacShaKeyFor(keyBytes);
    Map<String, Object> claimMap = null;
    try {
        Claims claims = Jwts
                .parser()
                .setSigningKey(key) // Set Key
                .parseClaimsJws(jwt) // 파싱 및 검증, 실패 시 에러
                .getBody();

        claimMap = claims;

    } catch (ExpiredJwtException e) { // 토큰이 만료되었을 경우
        return null;
    } catch (Exception e) { // 그외 에러났을 경우
        return null;
    }
    return claimMap;
  }   
}
