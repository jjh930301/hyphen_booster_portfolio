package com.booster.hyphen.nice.models;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.booster.hyphen.nice.utils.ForceNullsForMapTypeAdapterFactory;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class ServiceData {

  static public ResponseEntity<String> server_error(Exception except) {
    System.out.println("500 Server error"+except);
    Gson gson = new GsonBuilder()
        .registerTypeAdapterFactory(new ForceNullsForMapTypeAdapterFactory())
        .serializeNulls()
        .create();
    try {
      //message
      JsonObject json = new JsonObject();
      JsonArray arr = new JsonArray();
      arr.add("Server Error");
      json.add("message", arr);
      //payload
      JsonObject result = new JsonObject();
      result.add("result", JsonNull.INSTANCE);
      json.add("payload", result);
      //result_code
      json.addProperty("result_code", 5101);
      String data = gson.toJson(json);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(data);
    } catch(Exception e) {
      JsonObject jo = new JsonObject();
      jo.addProperty("error", "parsing error");
      String data = gson.toJson(jo);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(data);
    }
  }

  static public ResponseEntity<String> global_server_error() {
    Gson gson = new GsonBuilder()
        .registerTypeAdapterFactory(new ForceNullsForMapTypeAdapterFactory())
        .serializeNulls()
        .create();
    try {
      //message
      JsonObject json = new JsonObject();
      JsonArray arr = new JsonArray();
      arr.add("Global Server Error");
      json.add("message", arr);
      //payload
      JsonObject result = new JsonObject();
      result.add("result", JsonNull.INSTANCE);
      json.add("payload", result);
      //result_code
      json.addProperty("result_code", 5000);
      String data = gson.toJson(json);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(data);
    } catch(Exception e) {
      JsonObject jo = new JsonObject();
      jo.addProperty("error", "parsing error");
      String data = gson.toJson(jo);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(data);
    }
  }
  static public ResponseEntity<String> missingBodies() {
    Gson gson = new GsonBuilder()
        .registerTypeAdapterFactory(new ForceNullsForMapTypeAdapterFactory())
        .serializeNulls()
        .create();
    try {
      //message
      JsonObject json = new JsonObject();
      json.addProperty("message", "missing bodies");
      //payload
      JsonObject result = new JsonObject();
      result.add("result", JsonNull.INSTANCE);
      json.add("payload", result);
      //result_code
      json.addProperty("result_code", 5101);
      String data = gson.toJson(json);
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(data);
    } catch(Exception e) {
      JsonObject jo = new JsonObject();
      jo.addProperty("error", "parsing error");
      String data = gson.toJson(jo);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(data);
    }
  }

  static public ResponseEntity<String> expiredToken() {
    Gson gson = new GsonBuilder()
        .registerTypeAdapterFactory(new ForceNullsForMapTypeAdapterFactory())
        .serializeNulls()
        .create();
    try {
      //message
      JsonObject json = new JsonObject();
      json.addProperty("message", "Token is expired");
      //payload
      JsonObject result = new JsonObject();
      result.add("result", JsonNull.INSTANCE);
      json.add("payload", result);
      //result_code
      json.addProperty("result_code", 4001);
      String data = gson.toJson(json);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(data);
    } catch(Exception e) {
      JsonObject jo = new JsonObject();
      jo.addProperty("error", "parsing error");
      String data = gson.toJson(jo);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(data);
    }
  }

  static public ResponseEntity<String> invalid_request(
    String message ,
    int result_code
  ) {
    Gson gson = new GsonBuilder()
      .registerTypeAdapterFactory(new ForceNullsForMapTypeAdapterFactory())
      .serializeNulls()
      .create();
    try {
      JsonObject json = new JsonObject();
      JsonArray messages = new JsonArray();
      messages.add(message);
      json.add("message", messages);

      JsonObject result = new JsonObject();
      result.add("result", JsonNull.INSTANCE);
      json.add("payload", result);

      json.addProperty("result_code", result_code);
      String data = gson.toJson(json);
      System.out.println("invalid request"+message);
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(data);
    } catch(Exception e) {
      JsonObject jo = new JsonObject();
      jo.addProperty("error", "parsing error");
      String data = gson.toJson(jo);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(data);
    }
  }

  static public ResponseEntity<String> not_found(
    String message ,
    int result_code
  ) {
    Gson gson = new GsonBuilder()
      .registerTypeAdapterFactory(new ForceNullsForMapTypeAdapterFactory())
      .serializeNulls()
      .create();
    try {
      JsonObject json = new JsonObject();
      JsonArray messages = new JsonArray();
      messages.add(message);
      json.add("message", messages);

      JsonObject result = new JsonObject();
      result.add("result", JsonNull.INSTANCE);
      json.add("payload", result);

      json.addProperty("result_code", result_code);
      String data = gson.toJson(json);
      System.out.println("not found"+message);
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(data);
    } catch(Exception e) {
      JsonObject jo = new JsonObject();
      jo.addProperty("error", "parsing error");
      String data = gson.toJson(jo);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(data);
    }
  }

  static public ResponseEntity<String> nice_code_error(int return_code) {
    Gson gson = new GsonBuilder()
      .registerTypeAdapterFactory(new ForceNullsForMapTypeAdapterFactory())
      .serializeNulls()
      .create();
    try {

      JsonObject json = new JsonObject();

      JsonArray messages = new JsonArray();
      messages.add("Nice 평가정보 코드 에러");
      json.add("message", messages);
      //payload
      JsonObject result = new JsonObject();
      result.addProperty("result", return_code);
      json.add("payload", result);
      //result_code
      json.addProperty("result_code", return_code);
      String data = gson.toJson(json);
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(data);
    } catch(Exception e) {
      JsonObject jo = new JsonObject();
      jo.addProperty("error", "parsing error");
      String data = gson.toJson(jo);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(data);
    }
  }

  static public ResponseEntity<String> nice_error(int iReturn) {
    Gson gson = new GsonBuilder()
      .registerTypeAdapterFactory(new ForceNullsForMapTypeAdapterFactory())
      .serializeNulls()
      .create();
    try {
      //message
      JsonObject json = new JsonObject();

      JsonArray messages = new JsonArray();
      messages.add("Nice 정보통신 error");
      json.add("message", messages);
      //payload
      JsonObject result = new JsonObject();
      result.addProperty("result", iReturn);
      json.add("payload", result);
      //result_code
      json.addProperty("result_code", 4000);
      String data = gson.toJson(json);
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(data);
    } catch(Exception e) {
      JsonObject jo = new JsonObject();
      jo.addProperty("error", "parsing error");
      String data = gson.toJson(jo);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(data);
    }
  }

  static public ResponseEntity<String> ok(
    String message,
    Object payload,
    int result_code
  ) {
    Gson gson = new GsonBuilder()
      .serializeNulls()
      .registerTypeAdapterFactory(new ForceNullsForMapTypeAdapterFactory())
      .create();
  try {
      JsonObject json = new JsonObject();
      JsonArray msg = new JsonArray();
      msg.add(message);
      json.add("message", msg);
      json.add("payload", (JsonElement) payload);
      json.addProperty("result_code", result_code);
      String data = gson.toJson(json);
      if(!System.getenv("ENV").equals("production")) {
        System.out.println(message);
      }
      return ResponseEntity.status(HttpStatus.OK).body(data);
    } catch(Exception e) {
      System.out.println(e);
      JsonObject jo = new JsonObject();
      jo.addProperty("error", "parsing error");
      String data = gson.toJson(jo);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(data);
    }
  }
}
