import { Injectable } from "@nestjs/common";
import { Constants } from "src/constants/constants";
import { FcmType } from "src/constants/fcm.type";
import { Endpoint } from "src/constants/endpoint";
import { Urls } from "src/constants/urls";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
import { SelectHelper } from "src/helpers/select/select.helper";
import { ServiceData } from "src/models";
import { CustomHttp } from "src/models/custom.http";
import { TokenProvider } from "src/modules/booster/token.provider";
import { DateRangeDto } from "src/modules/main/dto/date.range.dto";
import { decrypt, encrypt } from "src/utils/crypto";
import { insertLoopDateParser, parseDate } from "src/utils/date";
import { FirebaseCloudMessage } from "src/utils/firebase.cloud.message";
import { SET_TIME, timeout } from "src/utils/timeout";
import { DataSource } from "typeorm";
import { AlertProvider } from "../alert/alert.provider";
import { CreateAlertVO } from "../alert/vo/create.alert.vo";
import { RegistHometaxAccountDto } from "../dto/regist.hometax.account.dto";
import { RegistHometaxDto } from "../dto/regist.hometax.dto";
import { UserProvider } from "../user.provider";
import { HometaxCashPurchaseProvider } from "./hometax.cash.purchase.provider";
import { HometaxCashSalesProvider } from "./hometax.cash.sales.provider";
import { HometaxTaxProvider } from "./hometax.tax.provider";

@Injectable()
export class HometaxService {

  constructor(
    private readonly userPvd : UserProvider,
    private readonly hometaxCashPurchasePvd : HometaxCashPurchaseProvider,
    private readonly hometaxCashSalesPvd : HometaxCashSalesProvider,
    private readonly hometaxTaxPvd : HometaxTaxProvider,
    private readonly datasource : DataSource,
    private readonly alertPvd : AlertProvider,
    private readonly tokenPvd : TokenProvider
  ){}

  public async registHometaxAccount(
    user : User,
    body : RegistHometaxAccountDto
  ) : Promise<ServiceData> {
    let b : UserBusiness = null
    if(body.business_id) {
      b = user.getBusiness(body.business_id);
      if(!b) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101,
          'user',
        )
      }
    }
    //홈택스 사업자 번호 조회 request
    let check = await this.checkHometax('ID',null ,body);
    if(check['error']) {
      check = await this.checkHometax('ID',null , body);
    }
    if(check['out']['errYn'] === 'Y') {
      return ServiceData.invalidRequest(check['out']['errMsg'] , 4104, 'user')
    }
    
    const biz : Object = check['out']['out']['data'];
    let business : UserBusiness = null;
    if(b) {
      let business : UserBusiness = null;
      if(10 === biz['txprDscmNo'].length) {
        if(biz['txprDscmNo'] === business.business_number) {
          business = b
        }
      } else {
        const bizes : Array<Object> = check['out']['out']['data']['bmanBscInfrInqrDVOList'];
        for(let i = 0 ; i < bizes.length ; i++) {
          if(bizes[i]['txprDscmNoEncCntn'] === b.business_number) {
            business = b;
          }
        }
      } 
    } else {
      // FIXED 프론트 배포되면 다음에 삭제할 코드
      if(10 === biz['txprDscmNo'].length) {
        business = await user.businesses.find(business => {
          if(biz['txprDscmNo'] === business.business_number) {
            return business
          }
        })
      } else {
        const bizes : Array<Object> = check['out']['out']['data']['bmanBscInfrInqrDVOList'];
        for(let i = 0 ; i < bizes.length ; i++) {
          for(let bn = 0 ; bn < user.businesses.length ; bn++) {
            if(bizes[i]['txprDscmNoEncCntn'] === user.businesses[bn].business_number) {
              business = user.businesses[bn];
            }
          }
        }
      } 
    }
    
    // business = await user.businesses.find(business => {
    //   return bizes.filter(async biz => {
    //     if(biz['txprDscmNoEncCntn'] === business.business_number) {
    //       console.log(business)
    //       return business
    //     }
    //   });
    // })

    if(!business) {
      return ServiceData.ok(
        '사업자번호 정보가 일치하지 않아 연결할 수 없습니다.',
        {
          user : null
        },
        4101
      )
    }
    try {
      

      /**
       * save business
       */
      business.store_name = business.store_name === null 
        ? check['out']['out']['data']['userNm'] 
        : business.store_name;
      business.hometax_id = body.hometax_id;
      business.hometax_password = body.hometax_password;
      business.hometax_updated_at = new Date();
      await this.userPvd.changedBusiness(business , {
        store_name : business.store_name === null 
        ? check['out']['out']['data']['userNm'] 
        : business.store_name,
        hometax_id : body.hometax_id,
        hometax_password : await encrypt(body.hometax_password),
        hometax_updated_at : new Date(),
      })
      
      /**
       * homrtax data insert
       */
      if(!business.hometax_login) {
        await this.userPvd.changedBusiness(
          business , 
          {
            hometax_login: true
          }
        )
        this.insertHometax(
          user,
          business
        );
      }

      const newUser : User = await this.userPvd.joinById(
        user.id , 
        SelectHelper.user_select
      );

      return ServiceData.ok(
        'Successfully regist hometax',
        {
          user : newUser
        },
        2101
      )

    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async registHometaxCertification(
    user : User,
    body : RegistHometaxDto
  ) : Promise<ServiceData> {
    //홈택스 사업자 번호 조회 request
    let check = await this.checkHometax('CERT',body);
    if(check['error']) {
      check = await this.checkHometax('CERT',body);
    }
    if(check['out']['errYn'] === 'Y') {
      return ServiceData.invalidRequest(check['out']['errMsg'], 4104 ,'user')
    }
    try {
      //등록된 사업자 번호와 request 확인
      const businesses : Array<UserBusiness> = await user.businesses.filter(async (business) => {
        if(business.business_number === check['out']['data']['txprDscmNo']) {
          business.store_name = check['out']['data']['userNm'];
          business.cert = body.hometax_cert;
          business.pri = body.hometax_pri;
          business.cert_password = body.hometax_cert_password;
          business.hometax_updated_at = new Date();
          await this.userPvd.changedBusiness(business , {
            store_name : check['out']['data']['userNm'],
            cert : body.hometax_cert,
            pri : body.hometax_pri,
            cert_password : body.hometax_cert_password,
            hometax_updated_at : new Date(),
          })
          return business;
        }
      })

      if(businesses.length === 0) {
        return ServiceData.ok(
          'Cannot found business number',
          {
            user : null
          },
          4101
        )
      }
      
      /**
       * (수정)homrtax data insert
       */

      const newUser : User = await this.userPvd.joinById(
        user.id , 
        SelectHelper.user_select
      );

      return ServiceData.ok(
        'Successfully regist hometax',
        {
          user : newUser
        },
        2101
      )

      
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  private async insertHometax(
    user : User,
    business : UserBusiness
  ) {
    const recentSales = await this.hometaxCashSalesPvd.findRecentOne(business);
    const recentPurchase = await this.hometaxCashPurchasePvd.findRecentOne(business);
    const recentTaxSales = await this.hometaxTaxPvd.findRecentOne(business , 1);
    const recentTaxPurchase = await this.hometaxTaxPvd.findRecentOne(business , 2);
    //local time
    let salesNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
    let purchaseNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
    let taxSalesNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
    let taxPurchaseNow = new Date(new Date().setMonth(new Date().getMonth() + 1));

    let salesDate;
    let purchaseDate;
    let taxSalesDate;
    let taxPurchaseDate;
    //business created_at
    if (recentSales) {
      salesDate = new Date(new Date(recentSales.trade_date).getUTCFullYear() , new Date(recentSales.trade_date).getMonth() , 1);
    } else {
      let salesCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
      salesDate = new Date(new Date().setFullYear(salesCreatedAt.getFullYear()-2));
    }
    if(recentPurchase) {
      purchaseDate = new Date(new Date(recentPurchase.trade_date).getUTCFullYear() , new Date(recentPurchase.trade_date).getMonth() , 1);
    } else {
      let purchaseCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
      purchaseDate = new Date(new Date().setFullYear(purchaseCreatedAt.getFullYear()-2));
    }
    if(recentTaxSales) {
      taxSalesDate = new Date(new Date(recentTaxSales.make_date).getUTCFullYear() , new Date(recentTaxSales.make_date).getMonth() , 1);
    } else {
      let taxSalesCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
      taxSalesDate = new Date(new Date().setFullYear(taxSalesCreatedAt.getFullYear()-2));
    }
    if(recentTaxPurchase) {
      taxPurchaseDate = new Date(new Date(recentTaxPurchase.make_date).getUTCFullYear() , new Date(recentTaxPurchase.make_date).getMonth() , 1);
    } else {
      let taxPurchaseCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
      taxPurchaseDate = new Date(new Date().setFullYear(taxPurchaseCreatedAt.getFullYear()-2));
    }

    const commonRange = new DateRangeDto();

    // insert now - 1 ex) 2022.08.31 ~ 2022.09.01(today)
    commonRange.start_date = parseDate(new Date(new Date().setDate(salesNow.getDate() - 3)));
    commonRange.end_date = parseDate(salesNow);

    // 현금영수증(매출)
    await this.insertHometaxCashSales(business , commonRange);
    for(let sales = salesNow ; salesDate <= sales ; sales.setMonth(sales.getMonth() -1)) {
      const dateRange = insertLoopDateParser(sales);
      await timeout(SET_TIME);
      await this.insertHometaxCashSales(business , dateRange);
    }

    // 현금영수증(매입)
    await this.insertHometaxCashPurchase(business , commonRange);
    for(let purchase = purchaseNow ; purchaseDate <= purchase ; purchase.setMonth(purchase.getMonth() -1)) {
      const dateRange = insertLoopDateParser(purchase);
      await timeout(SET_TIME);
      await this.insertHometaxCashPurchase(business , dateRange);
    }

    // 세금계산서(매출)
    await this.insertHometaxTaxSales(business , commonRange);
    for(let sales = taxSalesNow ; taxSalesDate <= sales ; sales.setMonth(sales.getMonth() -1)) {
      const dateRange = insertLoopDateParser(sales);
      await timeout(SET_TIME);
      await this.insertHometaxTaxSales(business , dateRange);
    }

    // 세금계산서(매입)
    await this.insertHometaxTaxPurchase(business , commonRange);
    for(let purchase = taxPurchaseNow ; taxPurchaseDate <= purchase ; purchase.setMonth(purchase.getMonth() -1)) {
      const dateRange = insertLoopDateParser(purchase);
      await timeout(SET_TIME);
      await this.insertHometaxTaxPurchase(business , dateRange);
    }

    // 상태 변경
    await this.userPvd.changedBusiness(
      business , 
      {
        hometax_login : false
      }
    )
    //(수정) 알림
    await this.alertPvd.createAlert(
      business,
      new CreateAlertVO(
        '새로운 연결기관 매출정보',
        '홈택스 매출 정보 불러오기를 완료했어요.', // 리팩토링
        business.id,
        Number(FcmType.HOMETAX),
        false
      )
    )
    // (수정) Ended insert data fcm message or web kakao sync message
    const devices = await Promise.all(user.devices.filter((device) => {
      if(device.token) {
        FirebaseCloudMessage.registAccount(
          FcmType.MESSAGE_TYPE[FcmType.HOMETAX].title,
          FcmType.MESSAGE_TYPE[FcmType.HOMETAX].body,
          FcmType.HOMETAX,
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
  }

  private async checkHometax(
    type : string , 
    cert : RegistHometaxDto | null = null,
    account : RegistHometaxAccountDto | null = null) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    if(cert) {
      return await http.post(
        Endpoint.HOMETAX_USER_INFO,
        {
          loginMethod : type,
          signCert : cert.hometax_cert,
          signPri : cert.hometax_pri,
          signPw : cert.hometax_cert_password
        }
      )
    }
    if(account) {
      return await http.post(
        'in0076000244',
        {
          loginMethod : type,
          userId : account.hometax_id,
          userPw : account.hometax_password
        }
      )
    }
  }
  private async hometaxCashSales(
    hometaxId : string,
    hometaxPassword : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )

    let cashSales = await http.post(
      Endpoint.HOMETAX_SALES_CASH,
      {
        userId : hometaxId,
        userPw : hometaxPassword,
        bizNo : businessNumber,
        inqrDtStrt : startDate,
        inqrDtEnd : endDate,
        detailYn : 'N',
      }
    );
    return cashSales;
    //check under line
  }

  private async insertHometaxCashSales(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxCashSales(
        business.hometax_id,
        await decrypt(business.hometax_password),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.hometaxCashSales(
          business.hometax_id,
          await decrypt(business.hometax_password),
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      if(!data['out']['list']) {
        await timeout();
        return await this.insertHometaxCashSales(business, date);
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxCashSalesPvd.upsert(business , d);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          hometax_login : false
        }
      )
    }
  }

  private async hometaxCashPurchase(
    hometaxId : string,
    hometaxPassword : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    try {
      let cashPurchase = await http.post(
        Endpoint.HOMETAX_PURCHASE_CASH,
        {
          userId : hometaxId,
          userPw : hometaxPassword,
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
      return cashPurchase;
    } catch(e) {
      await timeout();
      return await this.hometaxCashPurchase(
        hometaxId,
        hometaxPassword,
        businessNumber,
        startDate,
        endDate,
      )
    }
    //check under line
  }

  private async insertHometaxCashPurchase(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxCashPurchase(
        business.hometax_id,
        await decrypt(business.hometax_password),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.hometaxCashPurchase(
          business.hometax_id,
          await decrypt(business.hometax_password),
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      if(!data['out']['list']) {
        await timeout();
        return await this.insertHometaxCashPurchase(business , date);
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxCashPurchasePvd.upsert(business , d);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          hometax_login : false
        }
      )
    }
  }

  private async hometaxTaxSalse(
    hometaxId : string,
    hometaxPassword : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    try {
      let cashPurchase = await http.post(
        Endpoint.HOMETAX_SALES_TAX,
        {
          userId : hometaxId,
          userPw : hometaxPassword,
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
      return cashPurchase;
    } catch(e) {
      await timeout();
      return await this.hometaxTaxSalse(
        hometaxId,
        hometaxPassword,
        businessNumber,
        startDate,
        endDate,
      )
    }
    
    //check under line
  }

  private async insertHometaxTaxSales(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxTaxSalse(
        business.hometax_id,
        await decrypt(business.hometax_password),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.hometaxTaxSalse(
          business.hometax_id,
          await decrypt(business.hometax_password),
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      if(!data['out']['list']) {
        await timeout();
        return await this.insertHometaxTaxSales(
          business,
          date,
        )
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxTaxPvd.upsert(business , d);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          hometax_login : false
        }
      )
    }
  }

  private async hometaxTaxPurchase(
    hometaxId : string,
    hometaxPassword : string,
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )

    try {
      let cashPurchase = await http.post(
        Endpoint.HOMETAX_PURCHASE_TAX,
        {
          userId : hometaxId,
          userPw : hometaxPassword,
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
      return cashPurchase;
    } catch(e) {
      await timeout();
      return await this.hometaxTaxPurchase(
        hometaxId,
        hometaxPassword,
        businessNumber,
        startDate,
        endDate,
      )
    }
    //check under line
  }

  private async insertHometaxTaxPurchase(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxTaxPurchase(
        business.hometax_id,
        await decrypt(business.hometax_password),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.hometaxTaxPurchase(
          business.hometax_id,
          await decrypt(business.hometax_password),
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      if(!data['out']['list']) {
        await timeout();
        return await this.insertHometaxTaxPurchase(business , date);
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxTaxPvd.upsert(business , d);
        })
      }
    } catch(e) {
      await this.userPvd.changedBusiness(
        business , 
        {
          hometax_login : false
        }
      )
    }
  }
}