package com.booster.hyphen.nice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.booster.hyphen.nice.dto.auth.CertificationDto;
import com.booster.hyphen.nice.dto.auth.RegisterDto;
import com.booster.hyphen.nice.dto.auth.TokenDto;
import com.booster.hyphen.nice.dto.auth.UserInfoDto;
import com.booster.hyphen.nice.models.ServiceData;
import com.booster.hyphen.nice.response.MessageResponseModel;
import com.booster.hyphen.nice.response.PasswordResponseModel;
import com.booster.hyphen.nice.response.UserResponseModel;
import com.booster.hyphen.nice.services.AuthService;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("")
@CrossOrigin(origins = "*", allowedHeaders = "*" , methods = {RequestMethod.GET,RequestMethod.POST})
public class AuthController {

  @Autowired
  private AuthService authSvc;

  @ApiOperation(
    value = "문자 보내기",
    notes = "나머지 : 잘못된 정보 입력 / 23 : 잘못된 통신사 / 2000 : 성공 \n (SKT : 1 / KT : 2 / LG : 3 / SKT알뜰 : 5 / KT알뜰 : 6 / LGU+알뜰 : 7)",
    response = MessageResponseModel.class
  )
  @PostMapping(
    value = "/send",
    produces = MediaType.APPLICATION_JSON_VALUE
  )
  synchronized public ResponseEntity<String> send(
    @RequestBody UserInfoDto user_info_dto
  ) {
    if(
      user_info_dto.getName() == null ||
      user_info_dto.getJumin() == null ||
      user_info_dto.getMobile_co() == null ||
      user_info_dto.getMobile_no() == null 
    ) {
      return ServiceData.missingBodies();
    }
    try {
      return authSvc.send(user_info_dto);
    } catch(Exception e) {
      return ServiceData.server_error(e);
    }
  }

  @ApiOperation(
    value = "비밀번호 일치하지 않을 때 본인인증",
    notes = "나머지 : 잘못된 response 값 \n 12 : 인증코드가 여섯자리가 아닐 때  \n 1 : 잘못된 코드 입력 \n 2102 : 존재하지 않는 회원 \n \n 2103 탈퇴한 유저 관리자에 문의 ",
    response = PasswordResponseModel.class
  )
  @PostMapping(
    value = "/password",
    produces = MediaType.APPLICATION_JSON_VALUE
  )
  synchronized public ResponseEntity<String> password(
    @RequestBody CertificationDto dto
  ) {
    try {
      if(
        dto.getRes_code() == null || 
        dto.getAuth_no() == null
      ) {
        return ServiceData.missingBodies();
      }
      return authSvc.password(dto);
    } catch(Exception e) {
      return ServiceData.server_error(e);
    }
  }

  @ApiOperation(
    value = "문자 인증하기[회원가입 / 로그인]",
    notes = "나머지 : 잘못된 response 값 \n 12 : 인증코드가 여섯자리가 아닐 때  \n 1 : 잘못된 코드 입력 \n 2101 : 신규유저 \n 2102 : 기존 유저 \n 2103 탈퇴한 유저 관리자에 문의 ",
    response = UserResponseModel.class
  )
  @PostMapping(
    value = "/certification",
    produces = MediaType.APPLICATION_JSON_VALUE
  )
  synchronized public ResponseEntity<String> certification(
    @RequestBody RegisterDto registerDto
  ) {
    try {
      if(registerDto.getDevice_name() == null || 3 <= registerDto.getOperating_system()) {
        return ServiceData.missingBodies();
      }
      return authSvc.certification(registerDto);
    } catch(Exception e) {
      return ServiceData.server_error(e);
    }
  }

  @ApiOperation(
    value = "토큰 재발급",
    notes = "4001 : expired token / 4102 : user not found"
  )
  @PostMapping(
    value = "/token",
    produces = MediaType.APPLICATION_JSON_VALUE
  )
  synchronized public ResponseEntity<String> token(
    @RequestBody TokenDto tokenDto
  ) {
    try {
      //check
      if(
        tokenDto.getToken() == null ||
        tokenDto.getToken().equals("")
      ) {
        return ServiceData.invalid_request(
          "Missing body values",
          4101
        );
      }
      return authSvc.token(tokenDto);
    } catch(Exception e) {
      System.out.println(e);
      return ServiceData.server_error(e);
    }
  }

  @ApiOperation(
    value = "유저 정보",
    notes = "4000 : token is not exists \n 4001 : Expired token",
    response = UserResponseModel.class
  )
  @GetMapping(
    value = "/user",
    produces = MediaType.APPLICATION_JSON_VALUE
  )
  synchronized public ResponseEntity<String> user(
    @RequestHeader HttpHeaders header
  ) {
    String token = "";
    try {
      token = header.get("Authorization").get(0);
    } catch(NullPointerException e) {
      return ServiceData.invalid_request("Required header", 4000);
    }
    try {
      return authSvc.user(token);
    } catch(Exception e) {
      return ServiceData.server_error(e);
    }
  }
}
