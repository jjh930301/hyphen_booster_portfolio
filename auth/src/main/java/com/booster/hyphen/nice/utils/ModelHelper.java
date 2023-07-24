package com.booster.hyphen.nice.utils;

import java.util.Collection;
// import java.util.NoSuchElementException;

import com.booster.hyphen.nice.entities.Business;
import com.booster.hyphen.nice.entities.Device;
import com.booster.hyphen.nice.entities.User;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ModelHelper {
  static public JsonArray toDeviceArray(Collection<Device> iter) {
    Gson gson = new GsonBuilder()
      .registerTypeAdapterFactory(new ForceNullsForMapTypeAdapterFactory())
      .serializeNulls()
      .create();
    JsonArray arr = new JsonArray();
    
    iter.forEach(device -> {
      JsonObject json = new JsonObject();
      
      try {
        json.addProperty("id", device.getId().toString());
      } catch(Exception e) {
        json.add("id", JsonNull.INSTANCE);
      }
      try {
        json.addProperty("vendor_id", device.getVendor_id());
      } catch(Exception e) {
        json.add("vendor_id", JsonNull.INSTANCE);
      }
      try {
        json.addProperty("device_name", device.getDevice_name());
      } catch(Exception e) {
        json.add("device_name" , JsonNull.INSTANCE);
      }
      try {
        json.addProperty("token", device.getToken());
      } catch(Exception e) {
        json.add("token" , JsonNull.INSTANCE);
      }
      try {
        json.addProperty("card_sales_approval_alert", device.isCard_sales_approval_alert());
      } catch(Exception e) {
        json.add("card_sales_approval_alert" , JsonNull.INSTANCE);
      }
      try {
        json.addProperty("card_sales_cancel_alert", device.isCard_sales_cancel_alert());
      } catch(Exception e) {
        json.add("card_sales_cancel_alert" , JsonNull.INSTANCE);
      }
      try {
        json.addProperty("cash_sales_approval_alert", device.isCash_sales_approval_alert());
      } catch(Exception e) {
        json.add("cash_sales_approval_alert" , JsonNull.INSTANCE);
      }
      try {
        json.addProperty("cash_sales_cancel_alert", device.isCash_sales_cancel_alert());
      } catch(Exception e) {
        json.add("cash_sales_cancel_alert" , JsonNull.INSTANCE);
      }
      try {
        json.addProperty("report_alert", device.isReport_alert());
      } catch(Exception e) {
        json.add("report_alert" , JsonNull.INSTANCE);
      }
      
      arr.add(json);
    });
    
    String data = gson.toJson(arr);
    JsonArray json = (JsonArray) JsonParser.parseString(data);
    return json;
  }

  static public JsonArray toBzArray(Collection<Business> iter) {
    JsonArray arr = new JsonArray();

    iter.forEach(bz -> {
      JsonObject json = new JsonObject();
      try {
        json.addProperty("id", bz.getId().toString());
      } catch(Exception e) {
        json.add("id", JsonNull.INSTANCE);
      }
      try {
        json.addProperty("business_number", bz.getBusiness_number());
      } catch(Exception e) {
        json.add("business_number" , JsonNull.INSTANCE);
      }
      try {
        json.addProperty("store_name", bz.getStore_name());
      } catch(Exception e) {
        json.add("store_name", JsonNull.INSTANCE);
      }
      //'businesses.member_group_id',

      try {
        json.addProperty("member_group_id", bz.getMember_group_id());
      } catch(Exception e) {
        json.add("member_group_id", JsonNull.INSTANCE);
      }
      
      try {
        json.addProperty("crefia_id", bz.getCrefia_id());
      } catch(Exception e) {
        json.add("crefia_id" , JsonNull.INSTANCE);
      }

      try {
        if(bz.getCrefia_password() != null) {
          json.addProperty("crefia_account", true);
        } else {
          json.addProperty("crefia_account" , false);  
        }
      } catch(Exception e) {
        json.addProperty("crefia_account" , false);
      }

      try {
        json.addProperty("crefia_updated_at", bz.getCrefia_updated_at().toString());
      } catch(Exception e) {
        json.add("crefia_updated_at" , JsonNull.INSTANCE);
      }
      
      try {
        json.addProperty("hometax_id", bz.getHometax_id());
      } catch(Exception e) {
        json.add("hometax_id" , JsonNull.INSTANCE);
      }

      try {
        if(bz.getHometax_password() != null) {
          json.addProperty("hometax_account", true);
        } else if (bz.getCert() != null){
          json.addProperty("hometax_account" , true);  
        } else {
          json.addProperty("hometax_account" , false);  
        }
      } catch(Exception e) {
        json.addProperty("hometax_account" , false);
      }
      
      try {
        json.addProperty("hometax_cert_number", bz.getCert_number());
      } catch(Exception e) {
        json.add("hometax_cert_number",JsonNull.INSTANCE);
      }

      try {
        if(bz.getHometax_updated_at() != null) {
          json.addProperty("hometax_updated_at", bz.getHometax_updated_at().toString());
        } else if(bz.getCret_updated_at() != null) {
          json.addProperty("hometax_updated_at", bz.getCret_updated_at().toString());
        }
      } catch(Exception e) {
        json.add("hometax_updated_at" , JsonNull.INSTANCE);
      }

      try {
        json.addProperty("baemin_id", bz.getBaemin_id());
      } catch(Exception e) {
        json.add("baemin_id" , JsonNull.INSTANCE);
      }

      try {
        if(bz.getBaemin_password() != null) {
          json.addProperty("baemin_account", true);
        } else {
          json.addProperty("baemin_account" , false);  
        }
      } catch(Exception e) {
        json.addProperty("baemin_account" , false);
      }

      try {
        json.addProperty("baemin_updated_at", bz.getBaemin_updated_at().toString());
      } catch(Exception e) {
        json.add("baemin_updated_at" , JsonNull.INSTANCE);
      }

      try {
        json.addProperty("yogiyo_id", bz.getYogiyo_id());
      } catch(Exception e) {
        json.add("yogiyo_id" , JsonNull.INSTANCE);
      }

      try {
        if(bz.getYogiyo_password() != null) {
          json.addProperty("yogiyo_account", true);
        } else {
          json.addProperty("yogiyo_account" , false);  
        }
      } catch(Exception e) {
        json.addProperty("yogiyo_account" , false);
      }

      try {
        json.addProperty("yogiyo_updated_at", bz.getYogiyo_updated_at().toString());
      } catch(Exception e) {
        json.add("yogiyo_updated_at" , JsonNull.INSTANCE);
      }

      try {
        json.addProperty("coupange_id", bz.getCoupange_id());
      } catch(Exception e) {
        json.add("coupange_id" , JsonNull.INSTANCE);
      }

      try {
        if(bz.getCoupange_password() != null) {
          json.addProperty("coupange_account", true);
        } else {
          json.addProperty("coupange_account" , false);  
        }
      } catch(Exception e) {
        json.addProperty("coupange_account" , false);
      }

      try {
        json.addProperty("coupange_updated_at", bz.getCoupange_updated_at().toString());
      } catch(Exception e) {
        json.add("coupange_updated_at" , JsonNull.INSTANCE);
      }
      try {
        json.addProperty("type", bz.getType());
      } catch(Exception e) {
        json.add("type", JsonNull.INSTANCE);
      }
      try {
        json.addProperty("is_ksnet", bz.getIs_ksnet());
      } catch(Exception e) {
        json.add("is_ksnet", JsonNull.INSTANCE);
      }

      try {
        json.addProperty("is_paid", bz.getIs_paid());
      } catch(Exception e) {
        json.add("is_paid", JsonNull.INSTANCE);
      }

      try {
        json.addProperty("agreemented_at", bz.getAgreemented_at().toString());
      } catch(Exception e) {
        json.add("agreemented_at", JsonNull.INSTANCE);
      }
      
      arr.add(json);
    });
      
    return arr;
  }


  static public JsonObject userHelper(User model) {
    JsonObject result = new JsonObject();

    Collection<Device> idevice = model.getDevices();
    JsonArray devices = ModelHelper.toDeviceArray(idevice);

    Collection<Business> ibusiness = model.getBusinesses();
    JsonArray businesses = ModelHelper.toBzArray(ibusiness);

    result.addProperty("id", model.getId().toString());
    result.addProperty("name", model.getName());
    result.addProperty("type", model.getType()); // 아직 필요하지 않음
    result.addProperty("mobile", model.getMobile());
    result.addProperty("kakao_alert" , model.isKakao_alert());
    try {
      result.addProperty("mobile_company", model.getMobile_company());
    } catch(Exception e) {
      result.addProperty("mobile_company", "1");
    }
    
    result.addProperty("gender", model.getGender());
    result.addProperty("date_of_birth", model.getDate_of_birth().toString());
    result.add("devices", devices);
    result.add("businesses" , businesses);

    return result;
  }
}
