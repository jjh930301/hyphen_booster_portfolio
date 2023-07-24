import { Injectable } from '@nestjs/common';
import { Constants } from 'src/constants/constants';
import { Endpoint } from 'src/constants/endpoint';
import { FcmType } from 'src/constants/fcm.type';
import { Urls } from 'src/constants/urls';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { UserCert } from 'src/entities/booster/user/user.cert.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { UserPaid } from 'src/enums/user/user.paid';
import { ServiceData } from 'src/models';
import { CustomHttp } from 'src/models/custom.http';
import { decrypt, encrypt } from 'src/utils/crypto';
import { insertLoopDateParser, parseDashDate, parseDate } from 'src/utils/date';
import { FirebaseCloudMessage } from 'src/utils/firebase.cloud.message';
import { SET_TIME, timeout } from 'src/utils/timeout';
import { DataSource, DeleteResult, QueryRunner } from 'typeorm';
import { AlertProvider } from '../alert/alert.provider';
import { CreateAlertVO } from '../alert/vo/create.alert.vo';
import { DateRangeDto } from '../dto/date.rage.dto';
import { HometaxCashProvider } from '../hometax/hometax.cash.provider';
import { HometaxPurchaseProvider } from '../hometax/hometax.purchase.provider';
import { HometaxTaxProvider } from '../hometax/hometax.tax.provider';
import { CertDto } from './dto/cert.dto';
import { UpdateOrRemoveCertDto } from './dto/remove.cert.dto';
import { YLInfoModel } from './response/yl.info.response';
import { UserProvider } from './user.provider';

@Injectable()
export class UserService {
  constructor(
    private readonly datasource : DataSource,
    private readonly userPvd : UserProvider,
    private readonly hometaxPurchasePvd : HometaxPurchaseProvider,
    private readonly hometaxCashPvd : HometaxCashProvider,
    private readonly hometaxTaxPvd : HometaxTaxProvider,
    private readonly alertPvd : AlertProvider,
  ){}

  public async certList(user : User , businessId : string) : Promise<ServiceData>{
    try {
      const cert = await this.userPvd.findBzById(businessId);
      const certList = await this.userPvd.findCertByBusiness(businessId);
      if(!certList) return ServiceData.ok('not found cert' , {certs : []} , 2102)
      return ServiceData.ok(
        'Successfully getting cert list' , 
        {
          cert : cert?.cert_number ? cert?.cert_number : null,
          certs : certList
        } , 
        2101
      )
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async deleteCert(user : User , businessId : string, certNumber : string) : Promise<ServiceData> {
    
    try {
      const result : DeleteResult = await this.userPvd.deleteCert(user , certNumber);
      if (result.affected !== 1) {
        return ServiceData.serverCrudError()
      }
      const business = await this.userPvd.findBzById(businessId)
      if(business?.cert_number === certNumber) {
        await this.userPvd.changedBusiness(
          business , 
          {
            cert : null,
            pri : null,
            cert_password : null,
            cert_number : null,
            cert_issuer : null,
            cert_expiration : null,
            cret_updated_at : null,
          } , 
        )
      }
      // FIX: 해당 사업자의 인증서가 삭제하는 인증서인 경우 삭제
      
      return ServiceData.ok(`Successfully delete cert` , {result : true} , 2101)
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async cert(user : User ,business : UserBusiness, body : CertDto) : Promise<ServiceData> {
    try {
      //NOTE: 조회하지 않음
      //홈택스 사업자 번호 조회 request
      // let check = null;
      // let business : UserBusiness = null;
      // if(body.business_id) {
      //   business = await this.userPvd.findBzById(body.business_id);
      // } else {
      //   check= await this.checkHometax('CERT',body);
      //   if(check['error']) {
      //     check = await this.checkHometax('CERT',body);
      //   }
      //   //공동인증서에 등록된 사업자 번호가 맞는지 확인
      //   if(check['out']['errYn'] === 'Y') {
      //     return ServiceData.invalidRequest(check['out']['errMsg'], 4104 ,'user')
      //   }

      //   const biz : Object = check['out']['out']['data'];
      //   if(10 === biz['txprDscmNo'].length) {
      //     business = await user.businesses.find(business => {
      //       if(biz['txprDscmNo'] === business.business_number) {
      //         return business
      //       }
      //     })
      //   } else {
      //     const bizes : Array<Object> = check['out']['out']['data']['bmanBscInfrInqrDVOList'];
      //     for(let i = 0 ; i < bizes.length ; i++) {
      //       for(let bn = 0 ; bn < user.businesses.length ; bn++) {
      //         if(bizes[i]['txprDscmNoEncCntn'] === user.businesses[bn].business_number) {
      //           business = user.businesses[bn];
      //         }
      //       }
      //     }
      //   } 
      // }

      // if(!business) {
      //   // 등록된 사업자가 없을 경우 롤백
      //   return ServiceData.ok(
      //     'Cannot found business number',
      //     {
      //       user : null
      //     },
      //     4101
      //   )
      // }
      const cert = await this.userPvd.createCert(user , business , body)
      if(!cert) {
        return ServiceData.invalidRequest('cannot cretae cert' , 4102)
      }
      return ServiceData.ok(
        'Successfully regist cert',
        {
          cert : {
            business : cert.generatedMaps[0]['business'],
            cert_number : cert.generatedMaps[0]['cert_number'],
            cert_issuer : cert.generatedMaps[0]['cert_issuer'],
            cert_expiration : cert.generatedMaps[0]['cert_expiration'],
            oid : cert.generatedMaps[0]['oid'],
            cret_updated_at : cert.generatedMaps[0]['cret_updated_at'],
          }
        },
        2101
      )

    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async connectCert(
    user : User,
    query : UpdateOrRemoveCertDto
  ) : Promise<ServiceData> {
    try {
      const cert = await this.userPvd.findOneCertByBzAndCertNum(user , query.cert_number)
      if (!cert) {
        return ServiceData.noModelFound('cert')
      }
      let check = null;
      let business : UserBusiness = null;
      if(query.business_id) {
        business = await this.userPvd.findBzById(query.business_id);
      } else {
        check= await this.checkHometax('CERT',cert);
        if(check['error']) {
          check = await this.checkHometax('CERT',cert);
        }
        //공동인증서에 등록된 사업자 번호가 맞는지 확인
        if(check['out']['errYn'] === 'Y') {
          return ServiceData.invalidRequest(check['out']['errMsg'], 4104 ,'user')
        }

        const biz : Object = check['out']['out']['data'];
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

      if(!business) {
        // 등록된 사업자가 없을 경우 롤백
        return ServiceData.ok(
          'Cannot found business number',
          {
            user : null
          },
          4101
        )
      }
      
      await this.userPvd.changedBusiness(query.business , {
        cert : cert.cert,
        pri : cert.pri,
        cert_password : cert.cert_password,
        cert_number : cert.cert_number,
        cert_issuer : cert.cert_issuer,
        cert_expiration : cert.cert_expiration,
        cret_updated_at : cert.cret_updated_at,
      })
      const biz = await this.userPvd.findBzById(query.business.id);
      // 홈택스 매출 가지고 오기
      if(!biz.hometax_login) {
        await this.userPvd.changedBusiness(
          biz , 
          {
            hometax_login: true
          }
        )
        
        this.insertHometax(
          user,
          biz
        );
      }
      return ServiceData.ok('Successfully connect cert' , {result : true} , 2101);
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  private async checkHometax(
    type : string , 
    cert : UserCert,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    return await http.post(
      Endpoint.HOMETAX_USER_INFO,
      {
        loginMethod : type,
        signCert : await decrypt(cert.cert),
        signPri : await decrypt(cert.pri),
        signPw : await decrypt(cert.cert_password)
      }
    )
  }

  private async insertHometax(
    user : User,
    business : UserBusiness
  ) {
    const recentSales = await this.hometaxCashPvd.findRecentOne(business);
    const recentPurchase = await this.hometaxPurchasePvd.findRecentOne(business);
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
      purchaseDate = new Date(new Date(recentPurchase.trade_date).getUTCFullYear() , (new Date(recentPurchase.trade_date).getMonth() , 1));
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
      console.log('kakao message')
    }
  }

  private async hometaxCashSales(
    cert : string,
    pri : string,
    pw : string,
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
        signCert : cert,
        signPri : pri,
        signPw : pw,
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
        await decrypt(business.cert),
        await decrypt(business.pri),
        await decrypt(business.cert_password),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.hometaxCashSales(
          await decrypt(business.cert),
          await decrypt(business.pri),
          await decrypt(business.cert_password),
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
          this.hometaxCashPvd.upsert(business , d);
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
    cert : string,
    pri : string,
    pw : string,
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
          signCert : cert,
          signPri : pri,
          signPw : pw,
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
        cert ,
        pri ,
        pw ,
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
        await decrypt(business.cert),
        await decrypt(business.pri),
        await decrypt(business.cert_password),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.hometaxCashPurchase(
          await decrypt(business.cert),
          await decrypt(business.pri),
          await decrypt(business.cert_password),
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
          this.hometaxPurchasePvd.upsert(business , d);
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
    cert : string,
    pri : string,
    pw : string,
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
          signCert : cert,
          signPri : pri,
          signPw : pw,
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
        cert,
        pri,
        pw,
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
        await decrypt(business.cert),
        await decrypt(business.pri),
        await decrypt(business.cert_password),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.hometaxTaxSalse(
          await decrypt(business.cert),
          await decrypt(business.pri),
          await decrypt(business.cert_password),
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
    cert : string,
    pri : string,
    pw : string,
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
          signCert : cert,
          signPri : pri,
          signPw : pw,
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
        cert,
        pri,
        pw,
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
        await decrypt(business.cert),
        await decrypt(business.pri),
        await decrypt(business.cert_password),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        await timeout();
        data = await this.hometaxTaxPurchase(
          await decrypt(business.cert),
          await decrypt(business.pri),
          await decrypt(business.cert_password),
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

  public async onedayServiceInfo(business : UserBusiness) : Promise<ServiceData> {
    try {
      const http = new CustomHttp(
        Urls.HELLO_FIN,
        {
          'Content-Type':'multipart/form-data'
        }
      )
      if(!business.h_id) {
        return ServiceData.ok(
          "cannot get oneday service info",
          {data : null},
          2102
        )
      }
      const data = await http.post(
        Endpoint.HELLO_FIN_ONEDAY_SERVICE_INFO,
        {
          id : business?.h_id,
        }
      ) as unknown as YLInfoModel
      
      const model = data?.data?.[0]
      return ServiceData.ok(
        'Successfully getting oneday service info' , 
        {
          data : {
            business_uuid : model?.business_uuid ? model?.business_uuid : null,
            ylsolution_id : model?.ylsolution_id ? model?.ylsolution_id : null,
            status : model?.status ? model?.status : null,
            kyungnam_account_type : model?.kyungnam_account_type ? model?.kyungnam_account_type : null,
            kyungnam_account : model?.kyungnam_account ? model?.kyungnam_account : null,
            paid_account_type : model?.paid_account_type ? model?.paid_account_type : null,
            paid_account_bank_type : model?.paid_account_bank_type ? model?.paid_account_bank_type : null,
            paid_account : model?.paid_account ? model?.paid_account : null,
            sales_person_id : model?.sales_person_id ? model?.sales_person_id : null,
            sales_person_mobile : model?.sales_person_mobile ? model?.sales_person_mobile : null,
            contracted_at : model?.contracted_at ? model?.contracted_at : null,
            withdrawaled_at : model?.withdrawaled_at ? model?.withdrawaled_at : null,
            credit_id : model?.credit_id ? model?.credit_id : null,
            baemin_id : model?.baemin_id ? model?.baemin_id : null,
            yogiyo_id : model?.yogiyo_id ? model?.yogiyo_id : null,
          }
        } , 
        2101
      );
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async checkSales(salesId : string) : Promise<ServiceData>{
    try {
      const http = new CustomHttp(
        Urls.HELLO_FIN,
        {
          'Content-Type':'multipart/form-data'
        }
      )
      const data = await http.post(
        Endpoint.HELLO_FIN_CHECK_SALSE,
        {
          salesid : salesId
        }
      )
      if (data['success']) return ServiceData.ok('Successfully getting sales person' , {result : true} , 2101)
      return ServiceData.ok(data['message'] , {result : false} , 2102)
    } catch(e) {
      return ServiceData.serverError(e);
    }
  } 

  public async checkStore(business : UserBusiness) : Promise<ServiceData> {
    try {
      const http = new CustomHttp(
        Urls.HELLO_FIN,
        {
          'Content-Type':'multipart/form-data'
        }
      )
      const data = await http.post(
        Endpoint.HELLO_FIN_CHECK_STORE,
        {
          bizno : business.business_number,
          uuid : business.id
        }
      )
      if (data['success']) {
        if(data['message'] === '서비스중') {
          await this.userPvd.changedBusiness(business , {
            is_paid : UserPaid.paid,
            // array로 들어오는 이유
            h_id : data['data'][0]['LOGIN_ID']
          })
          return ServiceData.ok('Successfully check oneday service[paid business]', {result : true} , 2000)
        }
        return ServiceData.ok('Successfully check oneday service' , {result : true} , 2101)
      }
      return ServiceData.ok(data['message'] , {result : false} , 2102)
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async onedayService(
    user : User,
    business : UserBusiness,
    salesId : string
  ) : Promise<ServiceData> {
    try {
      const biz = await this.userPvd.findBzById(business.id)
      if(!biz) return ServiceData.noModelFound('business') 
      const http = new CustomHttp(
        Urls.HELLO_FIN,
        {
          'Content-Type':'multipart/form-data'
        }
      )
      const data = await http.post(
        Endpoint.HELLO_FIN_ONEDAY_SERVICE,
        {
          uuid : biz.id,
          storename : business.store_name, // 상호명
          repname : user.name, // 대표자명
          bizno : biz.business_number,
          hpno : user.mobile,
          salesid : salesId ? salesId : '',
          creditid : biz.crefia_id ? biz.crefia_id : '',
          creditpw : biz.crefia_password ? await decrypt(biz.crefia_password) : '',
          baeminid : biz.baemin_id ? biz.baemin_id : '',
          baeminpw : biz.baemin_password ? await decrypt(biz.baemin_password) : '',
          yogiyoid : biz.yogiyo_id ? biz.yogiyo_id : '',
          yogiyopw : biz.yogiyo_password ? await decrypt(biz.yogiyo_password) : ''
        }
      )
      await this.userPvd.changedBusiness(business , {
        is_paid : UserPaid.apply
      })
      if(data['success']) return ServiceData.ok('Successfully regist oneday service' , {result : true} , 2101)
      return ServiceData.ok(data['message'] , {result : false} , 2102)
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async ylsolutionCard(business : UserBusiness , date :DateRangeDto | null) : Promise<ServiceData> {
    try {
      const http = new CustomHttp(
        Urls.HELLO_FIN,
        {
          'Content-Type':'multipart/form-data'
        }
      )
      const data = await http.post(
        Endpoint.HELLO_FIN_CARD_SALES,
        {
          id : business.h_id,
          sdate : parseDashDate(date.start_date),
          edate : parseDashDate(date.end_date),
        }
      )
      return ServiceData.ok('ok' , {data : data} , 2101)
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async ylsolutionDelivery(business : UserBusiness , date :DateRangeDto) : Promise<ServiceData> {
    try {
      const http = new CustomHttp(
        Urls.HELLO_FIN,
        {
          'Content-Type':'multipart/form-data'
        }
      )
      const data = await http.post(
        Endpoint.HELLO_FIN_DELIVERY_SALES,
        {
          id : business.h_id,
          sdate : parseDashDate(date.start_date),
          edate : parseDashDate(date.end_date),
        }
      )
      return ServiceData.ok('ok' , {data : data} , 2101)
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async ylsolutionDeposit(business : UserBusiness , date :DateRangeDto) : Promise<ServiceData> {
    try {
      const http = new CustomHttp(
        Urls.HELLO_FIN,
        {
          'Content-Type':'multipart/form-data'
        }
      )
      const data = await http.post(
        Endpoint.HELLO_FIN_DEPOSIT,
        {
          id : business.h_id,
          sdate : parseDashDate(date.start_date),
          edate : parseDashDate(date.end_date),
        }
      )
      return ServiceData.ok('ok' , {data : data} , 2101)
    } catch(e) {
      return ServiceData.serverError(e);
    }
  }
}
