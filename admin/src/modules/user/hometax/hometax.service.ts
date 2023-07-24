import { Injectable } from "@nestjs/common";
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
import { HometaxCashPurchaseProvider } from "./hometax.cash.purchase.provider";
import { HometaxCashSalesProvider } from "./hometax.cash.sales.provider";
import { HometaxTaxProvider } from "./hometax.tax.provider";

@Injectable()
export class HometaxService {

  constructor(
    private readonly businessPvd : UserBusinessProvider,
    private readonly hometaxCashPurchasePvd : HometaxCashPurchaseProvider,
    private readonly hometaxCashSalesPvd : HometaxCashSalesProvider,
    private readonly hometaxTaxPvd : HometaxTaxProvider,
  ){}
  
  public async hometax(
    dto : InsertDto
  ) : Promise<ServiceData> {
    try {
      const business = await this.businessPvd.findByIdAccount(dto.business_id , 2);
      let check = await this.checkHometax('ID',business['comp_id'],business['password']);
      if(check['error']) {
        check = await this.checkHometax('ID',business['comp_id'],business['password']);
      }
      const text = String(check['out']['errMsg']).split(']')[2]
      if(check['out']['errYn'] === 'Y' && text === '비밀번호가') {
        return ServiceData.invalidRequest(check['out']['errMsg'] , 4101, 'result')
      }
      this.hometaxData(business , dto)
      return ServiceData.ok("Successfully insert hometax data" , {result : true},2101)
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  private async checkHometax(
    type : string , 
    id : string ,
    password : string) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    )
    try {
      return await http.post(
        Endpoint.HOMETAX_USER_INFO,
        {
          loginMethod : type,
          userId : id,
          userPw : await decrypt(password)
        }
      )
    } catch(e) {
      return await http.post(
        Endpoint.HOMETAX_USER_INFO,
        {
          loginMethod : type,
          userId : id,
          userPw : await decrypt(password)
        }
      )
    }
  }
  

  private async hometaxData(
    business : UserBusiness,
    dto : InsertDto
  ) {
    
    //local time
    let salesNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
    let purchaseNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
    let taxSalesNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
    let taxPurchaseNow = new Date(new Date().setMonth(new Date().getMonth() + 1));
    //business created_at
    let salesCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
    let purchaseCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
    let taxSalesCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
    let taxPurchaseCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
    //before one year
    const salesDate = new Date(new Date().setFullYear(salesCreatedAt.getFullYear()-2));
    const purchaseDate = new Date(new Date().setFullYear(purchaseCreatedAt.getFullYear()-2));
    const taxSalesDate = new Date(new Date().setFullYear(taxSalesCreatedAt.getFullYear()-2));
    const taxPurchaseDate = new Date(new Date().setFullYear(taxPurchaseCreatedAt.getFullYear()-2));

    const commonRange = new DateRangeDto();

    // insert now - 1 ex) 2022.08.31 ~ 2022.09.01(today)
    if(dto.start_date && dto.end_date) {
      commonRange.start_date = dto.start_date;
      commonRange.end_date = dto.end_date;
    } else {
      commonRange.start_date = parseDate(new Date(new Date().setDate(salesNow.getDate() - 3)));
      commonRange.end_date = parseDate(salesNow);
    }

    await this.insertHometaxCashSales(business , commonRange);
    await this.insertHometaxCashPurchase(business , commonRange);
    await this.insertHometaxTaxSales(business , commonRange);
    await this.insertHometaxTaxPurchase(business , commonRange);
    if(!dto.start_date || !dto.end_date) {
      // 현금영수증(매출)
      for(let sales = salesNow ; salesDate <= sales ; sales.setMonth(sales.getMonth() -1)) {
        const dateRange = insertLoopDateParser(sales);
        await timeout();
        await this.insertHometaxCashSales(business , dateRange);
      }
      // 현금영수증(매입)
      for(let purchase = purchaseNow ; purchaseDate <= purchase ; purchase.setMonth(purchase.getMonth() -1)) {
        const dateRange = insertLoopDateParser(purchase);
        await timeout();
        await this.insertHometaxCashPurchase(business , dateRange);
      }

      // 세금계산서(매출)
      for(let sales = taxSalesNow ; taxSalesDate <= sales ; sales.setMonth(sales.getMonth() -1)) {
        const dateRange = insertLoopDateParser(sales);
        await timeout();
        await this.insertHometaxTaxSales(business , dateRange);
      }

      // 세금계산서(매입)
      for(let purchase = taxPurchaseNow ; taxPurchaseDate <= purchase ; purchase.setMonth(purchase.getMonth() -1)) {
        const dateRange = insertLoopDateParser(purchase);
        await timeout();
        await this.insertHometaxTaxPurchase(business , dateRange);
      }
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
    try {
      let cashSales = await http.post(
        Endpoint.HOMETAX_SALES_CASH,
        {
          loginMethod : 'ID',
          userId : hometaxId,
          userPw : hometaxPassword,
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          // detailYn : 'N',
        }
      );
      return cashSales;
    } catch(e) {
      return await http.post(
        Endpoint.HOMETAX_SALES_CASH,
        {
          loginMethod : 'ID',
          userId : hometaxId,
          userPw : hometaxPassword,
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
    }
    //check under line
  }

  private async insertHometaxCashSales(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxCashSales(
        business['comp_id'],
        await decrypt(business['password']),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        data = await this.hometaxCashSales(
          business['comp_id'],
          await decrypt(business['password']),
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxCashSalesPvd.upsert(business , d);
        })
      }
    } catch(e) {
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
          loginMethod : 'ID',
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
      return await http.post(
        Endpoint.HOMETAX_PURCHASE_CASH,
        {
          loginMethod : 'ID',
          userId : hometaxId,
          userPw : hometaxPassword,
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
    }
  }

  private async insertHometaxCashPurchase(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxCashPurchase(
        business['comp_id'],
        await decrypt(business['password']),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        data = await this.hometaxCashPurchase(
          business['comp_id'],
          await decrypt(business['password']),
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxCashPurchasePvd.upsert(business , d);
        })
      }
    } catch(e) {
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
          loginMethod : 'ID',
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
      return await http.post(
        Endpoint.HOMETAX_SALES_TAX,
        {
          loginMethod : 'ID',
          userId : hometaxId,
          userPw : hometaxPassword,
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
    }
    
    //check under line
  }

  private async insertHometaxTaxSales(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxTaxSalse(
        business['comp_id'],
        await decrypt(business['password']),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        data = await this.hometaxTaxSalse(
          business['comp_id'],
          await decrypt(business['password']),
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxTaxPvd.upsert(business , d);
        })
      }
    } catch(e) {
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
          loginMethod : 'ID',
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
      
      return await http.post(
        Endpoint.HOMETAX_PURCHASE_TAX,
        {
          loginMethod : 'ID',
          userId : hometaxId,
          userPw : hometaxPassword,
          bizNo : businessNumber,
          inqrDtStrt : startDate,
          inqrDtEnd : endDate,
          detailYn : 'N',
        }
      );
    }
    
    //check under line
  }

  private async insertHometaxTaxPurchase(
    business : UserBusiness,
    date : DateRangeDto,
  ) : Promise<void> {
    try {
      let data = await this.hometaxTaxPurchase(
        business['comp_id'],
        await decrypt(business['password']),
        business.business_number,
        date.start_date,
        date.end_date,
      );
      if(data['resCd'] !== '0000') {
        
        data = await this.hometaxTaxPurchase(
          business['comp_id'],
          await decrypt(business['password']),
          business.business_number,
          date.start_date,
          date.end_date,
        );
      }
      const list = data['out']['list'] as Array<Object>;
      if(list.length !== 0) {
        list.forEach(d => {
          this.hometaxTaxPvd.upsert(business , d);
        })
      }
    } catch(e) {
    }
  }
    
}