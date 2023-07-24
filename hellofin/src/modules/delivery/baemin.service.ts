import { Injectable } from "@nestjs/common";
import { AxiosResponse } from "@nestjs/terminus/dist/health-indicator/http/axios.interfaces";
import { Constants } from "src/constants/constants";
import { Endpoint } from "src/constants/endpoint";
import { FcmType } from "src/constants/fcm.type";
import { Urls } from "src/constants/urls";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
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
export class BaeminService {
  constructor(
    private readonly userPvd : UserProvider,
    private readonly deliveryPvd : DeliveryProvider,
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
    private readonly alertPvd : AlertProvider
  ){}

  public async baemin(
    business : UserBusiness,
    baeminId : string,
    baeminPw : string,
  ) {
    let check = await this.checkBaemin(baeminId , baeminPw);

    if(!check['errYn']) {
      check = await this.checkBaemin(baeminId , baeminPw);
    }

    // 계정이 맞지 않을 경우 리턴
    if(check['errYn'] === 'Y') {
      await this.userPvd.changedBusiness(business , {
        baemin_id : baeminId
      })
      return
    }
    try { 
      await this.userPvd.changedBusiness(business , {
        baemin_id : baeminId,
        baemin_password : await encrypt(baeminPw),
        baemin_store_id : null,
        baemin_updated_at : business.baemin_updated_at ? business.baemin_updated_at : new Date(),
      })
      if(!business.baemin_login) {
        const biz = await this.userPvd.findByBzId(business.id);
        this.insertBaemin(biz)
      }
    } catch(e) {
      return;
    }
  }

  private async insertBaemin(
    business : UserBusiness
  ) : Promise<void> {
    try {
      const recentSales = await this.deliveryPvd.findRecentOne(business , 0);
      const recentDeposit = await this.deliveryDepositPvd.findRecentOne(business , 0);
      let salesNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
      let depositNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
      let salesDate
      let depositDate
      if(recentSales) {  
        salesDate  = new Date(recentSales.order_date.getUTCFullYear() , recentSales.order_date.getMonth() , 1);
      } else {
        let salesCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth()));
        salesDate = new Date(new Date().setFullYear(salesCreatedAt.getFullYear()-2));
      }
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
        await this.baeminSalesData(business,dateRange);
      }

      //배달정산 2년치 데이터
      for(let date = depositNow ; depositDate <= date; date.setMonth(date.getMonth()-1)) {
        const dateRange = insertLoopDateParser(date);
        await timeout(SET_TIME);
        await this.baeminDepositData(business,dateRange);
      }
      
      //데이터를 다 받고 데이터마켓 로그아웃
      await this.userPvd.changedBusiness(
        business , 
        {
          baemin_login : false
        }
      )
      //(수정) 알림
      await this.alertPvd.createAlert(
        business,
        new CreateAlertVO(
          '새로운 연결기관 매출정보',
          '배달의민족 매출 정보 불러오기를 완료했어요.', // 리팩토링
          business.id,
          Number(FcmType.BAEMIN),
          false
        )
      )
      const user = await this.userPvd.findDevicesByUserId(String(business.user))
      const devices = await Promise.all(user.devices.filter((device) => {
        if(device.token) {
          FirebaseCloudMessage.registAccount(
            FcmType.MESSAGE_TYPE[FcmType.BAEMIN].title,
            FcmType.MESSAGE_TYPE[FcmType.BAEMIN].body,
            FcmType.BAEMIN,
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
        console.log('kakao message')
      }
    } catch(e) {
      console.log(e);
    }
  }

  public async checkBaemin(
    baeminId : string,
    baeminPw : string,
  ) : Promise<AxiosResponse<any> | number> {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    
    return await http.post(
      Endpoint.BAEMIN_SHOP_INFO,
      {
        userId : baeminId,
        userPw : baeminPw,
      }
    )
  }

  private async baeminSales(
    baemin_id : string,
    baemin_password : string,
    startDate : string,
    endDate : string,
    process_YN : string | null = "N",
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );

    let baemins = await http.post(
      Endpoint.BAEMIN_SALES,
      {
        userId: baemin_id,
        userPw: baemin_password!,
        dateFrom: startDate,
        dateTo: endDate,
        detailYn: "Y",
        detailListYn: "N",
        processYn: process_YN
      }
    );
    const baeminList = baemins['data']['touchOrderList'] as Array<Object>;
    if(!baeminList) {
      await timeout();
      baemins = await this.baeminSales(baemin_id , baemin_password , startDate , endDate , process_YN);
    }
    return baemins;
  }

  private async baeminSalesData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.baeminSales(
        business.baemin_id,
        await decrypt(business.baemin_password),
        date.start_date,
        date.end_date
      );
      
      if(data['error']) {
        // 토큰 값이 이상할 때 "error": "Authorization Error"
        await timeout();
        data = await this.baeminSales(
          business.baemin_id,
          await decrypt(business.baemin_password),
          date.start_date,
          date.end_date
        );
      }
      if(data['errYn'] === "") {
        // "" = ID , PW가 맞지 않을 떄 리턴
        await this.userPvd.changedBusiness(
          business , 
          {
            baemin_login : false
          }
        )
        return;
      }
      
      const list = data['data']['touchOrderList'] as Array<Object>;
      // const list = data as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          //(수정) Refactorin
          this.deliveryPvd.baeminUpsert(business,data);
        })
      }
    } catch(e) {
      console.log(e);
      await this.userPvd.changedBusiness(
        business , 
        {
          baemin_login : false
        }
      )
    }
  }

  private async baeminDeposit(
    baemin_id : string,
    baemin_password : string,
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

    let baemins = await http.post(
      Endpoint.BAEMIN_DEPOSIT,
      {
        userId: baemin_id,
        userPw: baemin_password!,
        dateFrom: startDate,
        dateTo: endDate,
      }
    );
    const baeminList = baemins['data']['calList'] as Array<Object>;

    if(!baeminList) {
      await timeout();
      baemins = await this.baeminDeposit(baemin_id , baemin_password , startDate , endDate);
    }
    return baemins;
  }

  private async baeminDepositData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.baeminDeposit(
        business.baemin_id,
        await decrypt(business.baemin_password),
        date.start_date,
        date.end_date
      );
      
      if(data['common']['errYn'] === "" || data['common']['errYn'] === "Y") {
        // "" = ID , PW가 맞지 않을 떄 리턴
        await this.userPvd.changedBusiness(
          business , 
          {
            baemin_login : false
          }
        )
        return;
      }
      const list = data['data']['calList'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          //(수정) Refactorin
          this.deliveryDepositPvd.baeminUpsert(business,data);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          baemin_login : false
        }
      )
    }
  }
}