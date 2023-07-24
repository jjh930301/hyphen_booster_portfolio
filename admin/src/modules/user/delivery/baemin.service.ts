import { Injectable } from "@nestjs/common";
import { AxiosResponse } from "@nestjs/terminus/dist/health-indicator/http/axios.interfaces";
import { Constants } from "src/constants/constants";
import { Endpoint } from "src/constants/endpoint";
import { Urls } from "src/constants/urls";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ServiceData } from "src/models";
import { CustomHttp } from "src/models/custom.http";
import { DateRangeDto } from "src/modules/dashboard/dto/date.range.dto";
import { decrypt } from "src/utils/crypto";
import { insertLoopDateParser, parseDate } from "src/utils/date";
import { timeout } from "src/utils/timeout";
import { InsertDto } from "../dto/insert.dto";
import { UserBusinessProvider } from "../user.business.provider";
import { DeliveryDepositProvider } from "./delivery.deposit.provider";
import { DeliveryProvider } from "./delivery.provider";

@Injectable()
export class BaeminService {
  constructor(
    private readonly businessPvd : UserBusinessProvider,
    private readonly deliveryPvd : DeliveryProvider,
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
  ){}

  public async baemin(
    dto : InsertDto
  ) : Promise<ServiceData> {
    try {
      const business = await this.businessPvd.findByIdAccount(dto.business_id , 3)
      
      let check = await this.checkBaemin(
        business.id , 
        business.password
      );
      await timeout();
      if(!check['errYn']) {
        check = await this.checkBaemin(business.id , business.password);
      }
      const text = String(check['errMsg']).split(' ')[2]
      if(check['errYn'] === 'Y' && text === '비밀번호입니다.') {
        return ServiceData.invalidRequest(check['errMsg'] , 4101, 'result')
      }
      this.baeminData(business , dto)
      return ServiceData.ok("Successfully insert baemin data" , {result : true} , 2101);
    } catch(e) {
      return ServiceData.serverError();
    }
  }
  private async checkBaemin(
    id : string,
    password : string,
  ) : Promise<AxiosResponse<any> | number> {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    try {
      
      return await http.post(
        Endpoint.BAEMIN_SHOP_INFO,
        {
          userId : id,
          userPw : await decrypt(password),
        }
      )
    } catch(e) {
      return await http.post(
        Endpoint.BAEMIN_SHOP_INFO,
        {
          userId : id,
          userPw : await decrypt(password),
        }
      )
    }
  }

  private async baeminData(
    business : UserBusiness,
    dto : InsertDto
  ) {
    try {
      let salesNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
      let depositNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
      let salesCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth()));
      let depositCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth()));
      const salesTwoYear = new Date(new Date().setFullYear(salesCreatedAt.getFullYear()-2));
      const depositTwoYear = new Date(new Date().setFullYear(depositCreatedAt.getFullYear()-2));
      const commonRange = new DateRangeDto();
      if(dto.start_date && dto.end_date) {
        commonRange.start_date = dto.start_date;
        commonRange.end_date = dto.end_date;
      } else {
        commonRange.start_date = parseDate(new Date(new Date().setDate(salesNow.getDate() - 10)));
        commonRange.end_date = parseDate(salesNow);
      }
      await this.baeminSalesData(business,commonRange);
      await this.baeminDepositData(business,commonRange);
      if(!dto.start_date || !dto.end_date) {
        for(let date = salesNow ; salesTwoYear <= date; date.setMonth(date.getMonth()-1)) {
          const dateRange = insertLoopDateParser(date);
          await this.baeminSalesData(business,dateRange);
        }
  
        //배달정산 2년치 데이터
        for(let date = depositNow ; depositTwoYear <= date; date.setMonth(date.getMonth()-1)) {
          const dateRange = insertLoopDateParser(date);
          await this.baeminDepositData(business,dateRange);
        }
      }
    } catch(e) {}
  }

  private async baeminSalesData(
    business : UserBusiness,
    date : DateRangeDto
  ) : Promise<void> {
    try {
      let data = await this.baeminSales(
        business['comp_id'],
        business['password'],
        date.start_date,
        date.end_date
      );
      if(data['errYn'] === "" || data['errYn'] === "Y") {
        // "" = ID , PW가 맞지 않을 떄 리턴
        return;
      }
      const list = data['data']['touchOrderList'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(data => {
          //(수정) Refactorin
          this.deliveryPvd.baeminUpsert(business,data);
        })
      }
    } catch(e) {
      console.log(e)
    }
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
        userPw: await decrypt(baemin_password),
        dateFrom: startDate,
        dateTo: endDate,
        detailYn: "Y",
        detailListYn: "N",
        processYn: process_YN
      }
    );
    try {
      const baeminList = baemins['touchOrderList'] as Array<Object>;
      if(!baeminList) {
        baemins = await http.post(
          Endpoint.BAEMIN_SALES,
          {
            userId: baemin_id,
            userPw: await decrypt(baemin_password),
            dateFrom: startDate,
            dateTo: endDate,
            processYn: process_YN
          }
        );
      }
      return baemins;
    } catch(e) {
      return await http.post(
        Endpoint.BAEMIN_SALES,
        {
          userId: baemin_id,
          userPw: await decrypt(baemin_password),
          dateFrom: startDate,
          dateTo: endDate,
          processYn: process_YN
        }
      );
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
        userPw: await decrypt(baemin_password),
        dateFrom: startDate,
        dateTo: endDate,
      }
    );
    try {
      const baeminList = baemins['data']['calList'] as Array<Object>;

      if(!baeminList) {
        baemins = await http.post(
          Endpoint.BAEMIN_DEPOSIT,
          {
            userId: baemin_id,
            userPw: await decrypt(baemin_password),
            dateFrom: startDate,
            dateTo: endDate,
          }
        );
      }
    return baemins;
    } catch(e) {
      return await http.post(
        Endpoint.BAEMIN_DEPOSIT,
        {
          userId: baemin_id,
          userPw: await decrypt(baemin_password),
          dateFrom: startDate,
          dateTo: endDate,
        }
      );
    }
    
  }
  
  private async baeminDepositData(
    business : UserBusiness,
    date : DateRangeDto,
  ) {
    try {
      let data = await this.baeminDeposit(
        business['comp_id'],
        business['password'],
        date.start_date,
        date.end_date
      );
      
      if(data['common']['errYn'] === "" || data['common']['errYn'] === "Y") {
        // "" = ID , PW가 맞지 않을 떄 리턴
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
    }
  }
}