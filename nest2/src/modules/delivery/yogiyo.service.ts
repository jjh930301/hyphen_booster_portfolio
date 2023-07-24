import { Injectable } from "@nestjs/common";
import { Constants } from "src/constants/constants";
import { Endpoint } from "src/constants/endpoint";
import { Urls } from "src/constants/urls";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
import { SelectHelper } from "src/helpers/select/select.helper";
import { ServiceData } from "src/models";
import { CustomHttp } from "src/models/custom.http";
import { DeliveryProvider } from "src/modules/delivery/delivery.provider";
import { decrypt, encrypt } from "src/utils/crypto";
import { DataSource } from "typeorm";
import { UserProvider } from "../user/user.provider";
import { AccountDto } from "./dto/account.dto";
import { DeliveryDepositProvider } from "./delivery.deposit.provider";
import { AlertProvider } from "../alert/alert.provider";
import { CreateAlertVO } from "../alert/vo/create.alert.vo";
import { FcmType } from "src/constants/fcm.type";
import { FirebaseCloudMessage } from "src/utils/firebase.cloud.message";
import { insertLoopDateParser } from "src/utils/date";
import { SET_TIME, timeout } from "src/utils/timeout";
import { DateRangeDto } from "../dto/date.rage.dto";

@Injectable()
export class YogiyoService {
  constructor(
    private readonly deliveryPvd : DeliveryProvider,
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
    private readonly userPvd : UserProvider,
    private readonly alertPvd : AlertProvider,
    private readonly datasource : DataSource,
  ){}

  private async checkYogiyo(yogiyo : AccountDto) {
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
        userId : yogiyo.id,
        userPw : yogiyo.password,
        storeId : null
      }
    )
  }

  public async yogiyo(
    user : User,
    business : UserBusiness,
    body : AccountDto,
  ) : Promise<ServiceData> {
    let check = await this.checkYogiyo(body);

    //만료된 토큰일 경우
    if(!check['errYn']) {
      //토큰 발급 후 호출
      check = await this.checkYogiyo(body);
    }
    if(check['errYn'] === 'Y') {
      return ServiceData.invalidRequest(check['errMsg'] , 4104)
    }
    let storeId : string = null;
    const bizes : Array<Object> = check['data']['storeList'] as unknown as Array<Object>;
    business = bizes.find(biz => {
      const bizNo = String(biz['bizNo']).replace(/-/g, "")
      if(bizNo === business.business_number) {
        storeId = biz['storeId']
        return business
      } else {
        null
      }
    }) as unknown as UserBusiness
    if (!business) {
      return ServiceData.invalidRequest('사업자번호 정보가 일치하지 않아 연결할 수 없습니다.' , 4101 , 'user')
    }

    try {
      //Set yogiyo account
      await this.userPvd.changedBusiness(
        business,
        {
          yogiyo_id : body.id,
          yogiyo_password : await encrypt(body.password),
          yogiyo_store_id : storeId,
          yogiyo_updated_at : new Date(),
        }
      )

      const newUser : User = await this.userPvd.joinById(
        user.id , 
        SelectHelper.user_select
      );

      if(!business.yogiyo_login) {
        // insert yogiyo data
        await this.userPvd.changedBusiness(
          business , 
          {
            yogiyo_login : true
          }
        )
        const biz = await this.userPvd.findBzById(business.id);
        this.insertYogiyo(user , biz)
      }

      return ServiceData.ok(
        'Successfully regist yogiyo account' , 
        {user : newUser} , 
        2101
      )
    }catch(e) {
      return ServiceData.serverError(e)
    }
  }

  private async insertYogiyo(
    user : User,
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
        userPw: yogiyo_password,
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