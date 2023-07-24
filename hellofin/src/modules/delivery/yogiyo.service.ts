import { Injectable } from "@nestjs/common";
import { Constants } from "src/constants/constants";
import { Endpoint } from "src/constants/endpoint";
import { FcmType } from "src/constants/fcm.type";
import { Urls } from "src/constants/urls";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CustomHttp } from "src/models/custom.http";
import { decrypt, encrypt } from "src/utils/crypto";
import { insertLoopDateParser } from "src/utils/date";
import { FirebaseCloudMessage } from "src/utils/firebase.cloud.message";
import { SET_TIME, timeout } from "src/utils/timeout";
import { AlertProvider } from "../alert/alert.provider";
import { CreateAlertVO } from "../alert/vo/create.alert.vo";
import { DateRangeDto } from "../dto/date.rage.dto";
import { UserProvider } from "../user/user.provider";
import { DeliveryDepositProvider } from "./delivery.deposit.provider";
import { DeliveryProvider } from "./delivery.provider";

@Injectable()
export class YogiyoService {
  constructor(
    private readonly deliveryPvd : DeliveryProvider,
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
    private readonly userPvd : UserProvider,
    private readonly alertPvd : AlertProvider,
  ){}

  private async checkYogiyo(yogiyoId : string , yogiyoPw : string) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    
    return await http.post(
      Endpoint.YOGIYO_SHOP_INFO,
      {
        userId : yogiyoId,
        userPw : yogiyoPw,
        storeId : null
      }
    )
  }

  public async yogiyo(
    business : UserBusiness,
    yogiyoId : string,
    yogiyoPw : string,
  ) {
    let check = await this.checkYogiyo(yogiyoId , yogiyoPw);

    //만료된 토큰일 경우
    if(!check['errYn']) {
      //토큰 발급 후 호출
      check = await this.checkYogiyo(yogiyoId , yogiyoPw);
    }
    if(check['errYn'] === "Y") {
      await this.userPvd.changedBusiness(business , {
        yogiyo_id : yogiyoId
      })
      return 
    }
    let storeId : string = null;
    const bizes : Array<Object> = check['data']['storeList']
    for (let i = 0 ; i < bizes.length ; i++) {
      const bizNo = String(bizes[i]['bizNo']).replace(/-/g, "");
      if(bizNo === business.business_number) {
        storeId = bizes[i]['storeId']
      }
    }
    // 사업자번호가 맞지 않을 경우 입력하지 않음
    if(storeId === null) {
      await this.userPvd.changedBusiness(business , {
        yogiyo_id : yogiyoId
      })
      return
    }
    try {
      await this.userPvd.changedBusiness(business , {
        yogiyo_id : yogiyoId,
        yogiyo_password : await encrypt(yogiyoPw),
        yogiyo_store_id : storeId,
        yogiyo_updated_at : business.yogiyo_updated_at ? business.yogiyo_updated_at : new Date(),
      })
      if(!business.yogiyo_login) {
        const biz = await this.userPvd.findByBzId(business.id);
        this.insertYogiyo(biz)
      }
    } catch(e) {
      return
    }
  }

  private async insertYogiyo(
    business : UserBusiness,
  ) : Promise<void> {
    try {
      const recentDeposit = await this.deliveryDepositPvd.findRecentOne(business , 1);
      let salesNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
      let depositNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
      let salesDate = new Date(new Date().setMonth(new Date(Date.now()).getMonth() -4));;
      let depositDate;
      if(recentDeposit) {
        depositDate  = new Date(recentDeposit.settle_date.getUTCFullYear() , recentDeposit.settle_date.getMonth() , 1);
      } else {
        let depositCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth()));
        depositDate = new Date(new Date().setFullYear(depositCreatedAt.getFullYear()-2));
      }

      //배달매출 2년치 데이터
      for(let date = salesNow ; salesDate <= date; date.setMonth(date.getMonth()-1)) {
        const dateRange = insertLoopDateParser(date);
        await timeout(SET_TIME);
        await this.yogiyoSalesData(business,dateRange);
      }

      //배달정산 2년치 데이터
      for(let date = depositNow ; depositDate <= date; date.setMonth(date.getMonth()-1)) {
        const dateRange = insertLoopDateParser(date);
        await timeout(SET_TIME);
        await this.yogiyoDepositData(business,dateRange);
      }

      await this.userPvd.changedBusiness(
        business , 
        {
          yogiyo_login : false
        }
      )
      await this.alertPvd.createAlert(
        business,
        new CreateAlertVO(
          '새로운 연결기관 매출정보',
          '요기요 매출 정보 불러오기를 완료했어요.', // 리팩토링
          business.id,
          Number(FcmType.YOGIYO),
          false
        )
      )
      const user = await this.userPvd.findDevicesByUserId(String(business.user))
      const devices = await Promise.all(user.devices.filter((device) => {
        if(device.token) {
          FirebaseCloudMessage.registAccount(
            FcmType.MESSAGE_TYPE[FcmType.YOGIYO].title,
            FcmType.MESSAGE_TYPE[FcmType.YOGIYO].body,
            FcmType.YOGIYO,
            business,
            device.token
          )
          return device
        }
      })).then((result) => {
        return result
      })
      if(devices.length === 0) {
        // (수정) web kakao sync message
      }
    } catch(e) {
    }
  }

  private async yogiyoSales(
    yogiyo_id : string,
    yogiyo_password : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
    process_YN : string | null = "N",
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    let yogiyos = await http.post(
      Endpoint.YOGIYO_SALES,
      {
        userId: yogiyo_id,
        userPw: yogiyo_password!,
        dateFrom: startDate,
        dateTo: endDate,
        bizNo : businessNumber,
        detailYn: "Y",
        detailListYn: "N",
        processYn: process_YN
      }
    );
    const yogiyoList = yogiyos['data']['touchOrderList'] as Array<Object>;
    if(!yogiyoList) {
      await timeout();
      yogiyos = await this.yogiyoSales(yogiyo_id , yogiyo_password , startDate , endDate , process_YN);
    }
    return yogiyos;
  }

  private async yogiyoSalesData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.yogiyoSales(
        business.yogiyo_id,
        await decrypt(business.yogiyo_password),
        business.business_number,
        date.start_date,
        date.end_date
      );
      // 요기요는 최대 6개월치만 가지고 올 수 있습니다.
      if(data['error']) {
        // 토큰 값이 이상할 때 "error": "Authorization Error"
        await timeout();
        data = await this.yogiyoSales(
          business.yogiyo_id,
          await decrypt(business.yogiyo_password),
          business.business_number,
          date.start_date,
          date.end_date
        );
      }
      if(data['errYn'] === "") {
        // "" = ID , PW가 맞지 않을 떄 리턴
        await this.userPvd.changedBusiness(
          business , 
          {
            yogiyo_login : false
          }
        )
        return;
      }
      
      const list = data['data']['touchOrderList'] as Array<Object>;
      // const list = data as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          this.deliveryPvd.yogiyoUpsert(business,data);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          yogiyo_login : false
        }
      )
    }
  }

  private async yogiyoDeposit(
    yogiyo_id : string,
    yogiyo_password : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );

    let yogiyos = await http.post(
      Endpoint.YOGIYO_DEPOSIT,
      {
        userId: yogiyo_id,
        userPw: yogiyo_password!,
        dateFrom: startDate,
        dateTo: endDate,
        bizNo : businessNumber
      }
    );
    const yogiyoList = yogiyos['data']['calList'] as Array<Object>;

    if(!yogiyoList) {
      await timeout();
      yogiyos = await this.yogiyoDeposit(yogiyo_id , yogiyo_password , businessNumber ,startDate , endDate);
    }
    return yogiyos;
  }

  private async yogiyoDepositData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.yogiyoDeposit(
        business.yogiyo_id,
        await decrypt(business.yogiyo_password),
        business.business_number,
        date.start_date,
        date.end_date
      );
      if(data['common']['errYn'] === "" || data['common']['errYn'] === "Y") {
        // "" = ID , PW가 맞지 않을 떄 리턴
        await this.userPvd.changedBusiness(
          business , 
          {
            yogiyo_login : false
          }
        )
        return;
      }
      const list = data['data']['calList'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          this.deliveryDepositPvd.yogiyoUpsert(business,data);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          yogiyo_login : false
        }
      )
    }
  }
}