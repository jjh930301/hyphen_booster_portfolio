import { Injectable } from "@nestjs/common";
import { Constants } from "src/constants/constants";
import { Endpoint } from "src/constants/endpoint";
import { FcmType } from "src/constants/fcm.type";
import { Urls } from "src/constants/urls";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
import { SelectHelper } from "src/helpers/select/select.helper";
import { ServiceData } from "src/models";
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
import { AccountDto } from "./dto/account.dto";

@Injectable()
export class CoupangService {
  constructor(
    private readonly deliveryPvd : DeliveryProvider,
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
    private readonly userPvd : UserProvider,
    private readonly alertPvd : AlertProvider,
  ){}

  private async checkCoupangEats(dto : AccountDto) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    
    return await http.post(
      Endpoint.COUPANG_EATS_SHOP_INFO,
      {
        userId : dto.id,
        userPw : dto.password,
        storeId : null
      }
    )
  }

  public async coupangEats(
    user : User,
    business : UserBusiness,
    body :  AccountDto
  ) : Promise<ServiceData>{
    try {
      let check = await this.checkCoupangEats(body);

      //만료된 토큰일 경우
      if(!check['errYn']) {
        //토큰 발급 후 호출
        check = await this.checkCoupangEats(body);
      }
      if(check['errYn'] === 'Y') {
        return ServiceData.invalidRequest(check['errMsg'] , 4104)
      }
      let storeId : string = null;
      const bizes : Array<Object> = check['data']['storeList'] as unknown as Array<Object>;
      business = bizes.find(biz => {
        const bizNo = String(biz['bizNo']).replace(/-/g, "");
        if(bizNo === business.business_number) {
          storeId = biz['storeId']
          return business
        } else {
          null
        }
      }) as unknown as UserBusiness
      // 테스트 사업장에는 등록
      if (!business) {
        return ServiceData.invalidRequest('사업자번호 정보가 일치하지 않아 연결할 수 없습니다.' , 4101 , 'user')
      }
      try {
        //Set coupang eats account
        await this.userPvd.changedBusiness(
          business,
          {
            coupange_id : body.id,
            coupange_password : await encrypt(body.password),
            coupange_store_id : storeId,
            coupange_updated_at : new Date(),
          }
        )
  
        const newUser : User = await this.userPvd.joinById(
          user.id , 
          SelectHelper.user_select
        );
  
        if(!business.coupange_login) {
          // insert coupang eats data
          await this.userPvd.changedBusiness(
            business , 
            {
              coupange_login : true
            }
          )
          const biz = await this.userPvd.findBzById(business.id);
          this.insertCoupangEats(user , biz)
        }
  
        return ServiceData.ok(
          'Successfully regist coupang eats account' , 
          {user : newUser} , 
          2101
        )
      }catch(e) {
        return ServiceData.serverError(e)
      }
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  private async insertCoupangEats(
    user : User,
    business : UserBusiness,
  ) : Promise<void> {
    try {
      const recentSales = await this.deliveryPvd.findRecentOne(business , 1);
      const recentDeposit = await this.deliveryDepositPvd.findRecentOne(business , 1);
      let salesNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
      let depositNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
      let salesDate;
      let depositDate;
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
        await this.coupangEatsSalesData(business,dateRange);
      }

      //배달정산 2년치 데이터
      for(let date = depositNow ; depositDate <= date; date.setMonth(date.getMonth()-1)) {
        const dateRange = insertLoopDateParser(date);
        await timeout(SET_TIME);
        await this.coupangEatsDepositData(business,dateRange);
      }

      await this.userPvd.changedBusiness(
        business , 
        {
          coupange_login : false
        }
      )
      await this.alertPvd.createAlert(
        business,
        new CreateAlertVO(
          '새로운 연결기관 매출정보',
          '쿠팡이츠 매출 정보 불러오기를 완료했어요.', // 리팩토링
          business.id,
          Number(FcmType.COUPANGE),
          false
        )
      )
      const devices = await Promise.all(user.devices.filter((device) => {
        if(device.token) {
          FirebaseCloudMessage.registAccount(
            FcmType.MESSAGE_TYPE[FcmType.COUPANGE].title,
            FcmType.MESSAGE_TYPE[FcmType.COUPANGE].body,
            FcmType.COUPANGE,
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
    }
  }

  private async coupangEatsSales(
    coupange_id : string,
    coupange_password : string,
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
    let coupangs = await http.post(
      Endpoint.COUPANG_EATS_SALES,
      {
        userId: coupange_id,
        userPw: coupange_password!,
        dateFrom: startDate,
        dateTo: endDate,
        bizNo : businessNumber,
        detailYn: "Y",
        detailListYn: "N",
        processYn: process_YN
      }
    );
    const coupangList = coupangs['data']['touchOrderList'] as Array<Object>;
    if(!coupangList) {
      await timeout();
      coupangs = await this.coupangEatsSales(coupange_id , coupange_password , startDate , endDate , process_YN);
    }
    return coupangs;
  }

  private async coupangEatsSalesData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.coupangEatsSales(
        business.coupange_id,
        await decrypt(business.coupange_password),
        business.business_number,
        date.start_date,
        date.end_date
      );
      
      if(data['error']) {
        // 토큰 값이 이상할 때 "error": "Authorization Error"
        await timeout();
        data = await this.coupangEatsSales(
          business.coupange_id,
          await decrypt(business.coupange_password),
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
            coupange_login : false
          }
        )
        return;
      }
      
      const list = data['data']['touchOrderList'] as Array<Object>;
      // const list = data as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          this.deliveryPvd.coupangEatsUpsert(business,data);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          coupange_login : false
        }
      )
    }
  }

  private async coupangEatsDeposit(
    coupange_id : string,
    coupange_password : string,
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

    let coupangs = await http.post(
      Endpoint.COUPANG_EATS_DEPOSIT,
      {
        userId: coupange_id,
        userPw: coupange_password!,
        dateFrom: startDate,
        dateTo: endDate,
        bizNo : businessNumber
      }
    );
    const coupangList = coupangs['data']['calList'] as Array<Object>;

    if(!coupangList) {
      await timeout();
      coupangs = await this.coupangEatsDeposit(coupange_id , coupange_password , businessNumber ,startDate , endDate);
    }
    return coupangs;
  }

  private async coupangEatsDepositData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.coupangEatsDeposit(
        business.coupange_id,
        await decrypt(business.coupange_password),
        business.business_number,
        date.start_date,
        date.end_date
      );
      
      if(data['common']['errYn'] === "" || data['common']['errYn'] === "Y") {
        // "" = ID , PW가 맞지 않을 떄 리턴
        await this.userPvd.changedBusiness(
          business , 
          {
            coupange_login : false
          }
        )
        return;
      }
      const list = data['data']['calList'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          this.deliveryDepositPvd.coupangEatsUpsert(business,data);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          coupange_login : false
        }
      )
    }
  }
}