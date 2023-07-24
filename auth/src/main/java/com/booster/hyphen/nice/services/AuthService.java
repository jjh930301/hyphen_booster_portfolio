package com.booster.hyphen.nice.services;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;

import com.booster.hyphen.nice.dto.auth.CertificationDto;
import com.booster.hyphen.nice.dto.auth.RegisterDto;
import com.booster.hyphen.nice.dto.auth.TokenDto;
import com.booster.hyphen.nice.dto.auth.UserInfoDto;
import com.booster.hyphen.nice.entities.Business;
import com.booster.hyphen.nice.entities.Device;
import com.booster.hyphen.nice.entities.Inquiry;
import com.booster.hyphen.nice.entities.Report;
import com.booster.hyphen.nice.entities.User;
import com.booster.hyphen.nice.enums.OperatingSystemType;
import com.booster.hyphen.nice.enums.user.UserType;
import com.booster.hyphen.nice.models.KakaoUserInfo;
import com.booster.hyphen.nice.models.ServiceData;
// import com.booster.hyphen.nice.repositories.AlertRepository;
// import com.booster.hyphen.nice.repositories.BusinessRepository;
import com.booster.hyphen.nice.repositories.DeviceRepository;
// import com.booster.hyphen.nice.repositories.InquiryRespository;
// import com.booster.hyphen.nice.repositories.ReportRepository;
import com.booster.hyphen.nice.repositories.UserRepository;
import com.booster.hyphen.nice.utils.JwtUtil;
import com.booster.hyphen.nice.utils.ModelHelper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import CheckPlus.nice.MCheckPlus;
import lombok.RequiredArgsConstructor;

import com.booster.hyphen.nice.utils.*;

@Service
@RequiredArgsConstructor
public class AuthService {

  @Autowired
  private final UserRepository userRepo;
  // @Autowired
  // private final BusinessRepository businessRepo;
  @Autowired
  private final DeviceRepository deviceRepo;
  // @Autowired
  // private final InquiryRespository inquiryRepo;
  // @Autowired
  // private final AlertRepository alertRepo;
  // @Autowired
  // private final ReportRepository reportRepo;

  // NICE평가정보에서 발급한 본인인증 서비스 개발 정보(사이트 코드 , 사이트 패스워드)
  private String sSiteCode	= System.getenv("NICE_SITE_CODE");
  private String sSitePw		= System.getenv("NICE_PASSWORD");
  
  private String sCPRequest	= System.getenv("NICE_SECRET");

  // Method 결과값(iReturn)에 따라, 프로세스 진행여부를 파악합니다.
  private int iReturn = -1;

  private MCheckPlus cpMobile = new MCheckPlus();

  public ResponseEntity<String> send(
    UserInfoDto user_info
  ) {
    try {
      if(user_info.getMobile_no().equals("01017663030")) {
        JwtUtil jwt = new JwtUtil();
        // testing 비봉부동산
        User user = userRepo.findById(UUID.fromString("7a22ec29-fe2a-483d-91b1-1ce17db7dbfb")).get();
        String access_token = jwt.createAccessToken(
          user.getId().toString(), 
          user.getMobile(), 
          100
        );
        JsonObject userModel = ModelHelper.userHelper(user);
        JsonObject payload = new JsonObject();
        payload.add("user", userModel);
        payload.addProperty("access_token" , access_token);
        return ServiceData.ok(
          "Test account", 
          payload, 
          2101
        );
      }
      iReturn = cpMobile.fnRequestSafeAuth(
        sSiteCode, 
        sSitePw, 
        user_info.getJumin(), // 주민번호
        user_info.getName(), // 이름
        user_info.getMobile_co(), // (SKT : 1 / KT : 2 / LG : 3 / SKT알뜰 : 5 / KT알뜰 : 6 / LGU+알뜰 : 7)
        user_info.getMobile_no(), // 전화번호
        sCPRequest // request body
      );
      JsonObject payload = new JsonObject();
      if(!cpMobile.getReturnCode().equals("0000") && !cpMobile.getReturnCode().equals("")) {
        return ServiceData.nice_code_error(Integer.parseInt(cpMobile.getReturnCode()));
      }
      if (iReturn == 0) {
        // 요청 고유번호
        // payload.addProperty("req_code", cpMobile.getRequestSEQ());
        // 응답 고유번호
        payload.addProperty("res_code", cpMobile.getResponseSEQ());

        return ServiceData.ok(
          "Successfully send message", 
          payload, 
          2101
        );
      } else {
        return ServiceData.nice_error(iReturn);
      }
    } catch(Exception e) {
      return ServiceData.server_error(e);
    }
  }

  @Transactional(
    propagation = Propagation.REQUIRED,
    rollbackFor = Exception.class
  )
  synchronized public ResponseEntity<String> certification(
    RegisterDto registerDto
  ) {
    if(
      registerDto.getRes_code() == null || 
      registerDto.getDate_of_birth() == null || 
      registerDto.getMobile() == null || 
      registerDto.getName() == null || 
      registerDto.getAuth_no() == null
    ) {
      return ServiceData.missingBodies();
    }
    iReturn = cpMobile.fnRequestConfirm(
      sSiteCode, 
      sSitePw, 
      registerDto.getRes_code(), 
      registerDto.getAuth_no(),
      sCPRequest
    );
    // iReturn = 0;
    // 응답코드
    String return_code = cpMobile.getReturnCode();
    // String return_code = "0000";
    // 아이핀 연결정보
    String client_id = cpMobile.getResponseCI();
    // String client_id = "nEEul2iZhQEIJd/hAjl/EWcLLxmgO/AJB0q2PyPdlYNq76PSmS89GjJOlO0+mtqpYvincs3T/a8o4FFJIFfMWQ==";
    // // 아이핀 중복가입확인정보
    String di = cpMobile.getResponseDI();
    // String di = "MC0GCCqGSIb3DQIJAyEAjdJa9zjbSa3LWgyJLknDPIpSFvtldOefBsFjfdvfbto=";

    if(!return_code.equals("0000")) {
      return ServiceData.nice_code_error(Integer.parseInt(return_code));
    }

    // 기존 유저가 있는지 확인
    User new_user = userRepo.findOneByCientId(client_id);

    JsonObject payload = new JsonObject();
    JwtUtil jwt = new JwtUtil();
    int result_code;

    if(iReturn == 0) {
      // 유저 초기화
      User user = null;
      
      // 신규 디바이스 초기화
      Device new_device = null;
      if(new_user != null) {
        if(new_user.getDeleted_at() == null) {
          user = new_user;
          // 통신사 변경
          if(registerDto.getMobile_co() != null) {
            user.setMobile_company(registerDto.getMobile_co());
          }
          // 전화번호 변경
          if(registerDto.getMobile() != null) {
            user.setMobile(registerDto.getMobile());
          }
          userRepo.save(user);
          
          result_code = 2102;
        } else {
          result_code = 2103;
        }
        
      } else {
        // 신규 유저일 경우
        result_code = 2101;
        new_user = new User();
        new_user.setClient_id(client_id);
        new_user.setDi(di);
        new_user.setName(registerDto.getName());
        new_user.setMobile(registerDto.getMobile());
        new_user.setType(UserType.use.ordinal());
        new_user.setGender(registerDto.getGender());
        new_user.setKakao_alert(true);
        new_user.setDate_of_birth(registerDto.getDate_of_birth());
        new_user.setMobile_company(registerDto.getMobile_co());
        
        // ManyToOne HashSet 초기화 
        // new_user.setAlerts(new ArrayList<Alert>());
        new_user.setBusinesses(new ArrayList<Business>());
        new_user.setDevices(new ArrayList<Device>());
        new_user.setReports(new ArrayList<Report>());
        new_user.setInquiries(new ArrayList<Inquiry>());
      }

      // 디바이스는 무조건 새로 생성
      new_device = new Device();
      new_device.setCard_sales_approval_alert(false);
      new_device.setCard_sales_cancel_alert(true);
      new_device.setCash_sales_approval_alert(false);
      new_device.setCash_sales_cancel_alert(true);
      new_device.setReport_alert(true);
      new_device.setUnpaid_unpurchase_alert(true);
      new_device.setOperating_system(registerDto.getOperating_system());
      new_device.setVendor_id(registerDto.getVendor_id());
      new_device.setDevice_name(registerDto.getDevice_name());
      // new_device.setDevice_id(registerDto.getDevice_id());
      new_device.setToken(registerDto.getToken());
      //refresh token
      String refresh_token = jwt.refreshToken(client_id, registerDto.getName() , registerDto.getOperating_system());
      new_device.setRefresh_token(refresh_token);

      // 기존 유저가 null일 경우 신규 유저에 저장
      new_device.setUser(user == null ? new_user : user);

      if(user == null) {
        user = userRepo.save(new_user);
      }
      //웹으로 접속한 것들 찾아서 삭제
      if(registerDto.getOperating_system() == OperatingSystemType.web.ordinal()) {
        for(Device device : user.getDevices()) {
          if(device.getOperating_system() == OperatingSystemType.web.ordinal()) {
            deviceRepo.delete(device);
          }
        }
        user.getDevices().removeIf(d -> d.getOperating_system() == OperatingSystemType.web.ordinal());
      }
      //삭제 이후 디바이스가 5개보다 많은 경우 삭제
      boolean flag = true;
      for(int i = 0 ; i < user.getDevices().size() ; i++) {
        Device device = user.getDevices().get(i);
        //vendor_id가 같을 때 삭제
        if(device.getVendor_id() != null) {
          if(registerDto.getVendor_id().equals(device.getVendor_id())) {
            deviceRepo.delete(device);
            user.getDevices().remove(device);
            flag = false;
          }
        }
        if(!flag) {
          if(5 <= i) {
            deviceRepo.delete(user.getDevices().get(0));
            user.getDevices().remove(0);
          }
        }
        
      }
      
      // 신규 디바이스는 무조건 추가
      if(new_device != null) {
        deviceRepo.save(new_device);
        user.getDevices().add(new_device);
      }
      
      String access_token = jwt.createAccessToken(
        user.getId().toString(),
        user.getMobile(),
        UserType.use.ordinal()
      );
      
      if(result_code == 2103) {
        payload.add("user", JsonNull.INSTANCE);
      } else {
        JsonObject model = ModelHelper.userHelper(user);
        payload.add("user", model);
        payload.addProperty("access_token", access_token);
        payload.addProperty("refresh_token", new_device.getRefresh_token());
      }
      
      // String data = gson.toJson(payload);
      return ServiceData.ok(
        "Successfully regist user", 
        payload, 
        result_code
      );
    } else if (iReturn == -7 || iReturn == -8) {
      System.out.println("AUTH_ERROR=" + iReturn);
      System.out.println("서버 네트웍크 및 방확벽 관련하여 아래 IP와 Port를 오픈해 주셔야 이용 가능합니다.");
      System.out.println("IP : 121.131.196.200 / Port : 3700 ~ 3715");
      return ServiceData.nice_error(iReturn);
    } else if(iReturn == -9 || iReturn == -10 || iReturn == 1) {
      System.out.println("AUTH_ERROR=" + iReturn);
      System.out.println("입력값 오류 : fnRequest 함수 처리시, 필요한 5개의 파라미터값의 정보를 정확하게 입력해 주시기 바랍니다.");
      return ServiceData.nice_error(iReturn);
    } else {
      System.out.println("AUTH_ERROR=" + iReturn);
      System.out.println("iReturn 값 확인 후, NICE평가정보 전산 담당자에게 문의해 주세요.");
      return ServiceData.nice_error(iReturn);
    }
  }

  @Transactional(
    propagation = Propagation.REQUIRED,
    rollbackFor = Exception.class
  )
  synchronized public ResponseEntity<String> password(
    CertificationDto dto
  ) {
    iReturn = cpMobile.fnRequestConfirm(
      sSiteCode, 
      sSitePw, 
      dto.getRes_code(), 
      dto.getAuth_no(),
      sCPRequest
    );
    // iReturn = 0;
    String return_code = cpMobile.getReturnCode();
    String client_id = cpMobile.getResponseCI();

    if(!return_code.equals("0000")) {
      return ServiceData.nice_code_error(Integer.parseInt(return_code));
    }

    if(iReturn == 0) {
      User user = userRepo.findOneByCientId(client_id);
      JsonObject payload = new JsonObject();
      if(user == null) {
        payload.addProperty("result", false);
        return ServiceData.ok(
          "Already withdrawn user", 
          payload, 
          2102);
      }
      if(user.getDeleted_at() == null) {
        payload.addProperty("result", true);
        return ServiceData.ok(
          "Successfully mobile certification" , 
          payload , 
          2101);
      } else {
        payload.addProperty("result", false);
        return ServiceData.ok(
          "Already withdrawn user", 
          payload, 
          2103
        );
      }
    }  else if (iReturn == -7 || iReturn == -8) {
      System.out.println("AUTH_ERROR=" + iReturn);
      System.out.println("서버 네트웍크 및 방확벽 관련하여 아래 IP와 Port를 오픈해 주셔야 이용 가능합니다.");
      System.out.println("IP : 121.131.196.200 / Port : 3700 ~ 3715");
      return ServiceData.nice_error(iReturn);
    } else if(iReturn == -9 || iReturn == -10 || iReturn == 1) {
      System.out.println("AUTH_ERROR=" + iReturn);
      System.out.println("입력값 오류 : fnRequest 함수 처리시, 필요한 5개의 파라미터값의 정보를 정확하게 입력해 주시기 바랍니다.");
      return ServiceData.nice_error(iReturn);
    } else {
      System.out.println("AUTH_ERROR=" + iReturn);
      System.out.println("iReturn 값 확인 후, NICE평가정보 전산 담당자에게 문의해 주세요.");
      return ServiceData.nice_error(iReturn);
    }
  }


  public ResponseEntity<String> token(
    TokenDto tokenDto
  ) {
    JwtUtil jwt = new JwtUtil();
    try {
      Map<String , Object> verification = jwt.verifyJWT(tokenDto.getToken());
      if(verification == null) {
        return ServiceData.expiredToken();
      }
      //client_id 값 찾기
      User user = userRepo.findOneByCientId(verification.get("id").toString());
      if(user == null) {
        return ServiceData.not_found("User not found", 4102);
      }
      
      Device device = deviceRepo.findById(tokenDto.getId()).get();
      if(device == null) {
        return ServiceData.not_found("Device is not found", 4103);
      }
      if(!device.getRefresh_token().equals(tokenDto.getToken())) {
        return ServiceData.expiredToken();
      }
      String refresh_token = jwt.refreshToken(
        user.getClient_id(), 
        user.getName(),
        device.getOperating_system()
      );
      device.setRefresh_token(refresh_token);
      user.setRefreshed_at(new Date());
      userRepo.save(user);
      deviceRepo.save(device);
      // User user = userRepo.findById(tokenDto.getId()).get();
      
      String access_token = jwt.createAccessToken(
        user.getId().toString(), 
        user.getMobile(), 
        user.getType()
      );
      JsonObject payload = new JsonObject();
      payload.addProperty("access_token", access_token);
      payload.addProperty("refresh_token", refresh_token);
      return ServiceData.ok(
        "Successfully getting new token", 
        payload, 
        2101
      );
    } catch(Exception e) {
      return ServiceData.server_error(e);
    }   
  }

  public ResponseEntity<String> user(String bearerToken) {
    JwtUtil jwt = new JwtUtil();
    try {
      String[] token = bearerToken.split("Bearer ");
      Map<String , Object> verification = jwt.verifyAccessToken(token[1]);
      if(verification == null) {
        return ServiceData.expiredToken();
      }
      User user = userRepo.findById(UUID.fromString(verification.get("id").toString())).get();
      if(user == null) {
        return ServiceData.not_found("user not found", 4101);
      }
      JsonObject userModel = ModelHelper.userHelper(user);
      JsonObject payload = new JsonObject();
      payload.add("user", userModel);
      return ServiceData.ok("Successfully getting user infos", payload, 2101);
    } catch(Exception e) {
      return ServiceData.server_error(e);
    }
  }
}
