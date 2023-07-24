import { Injectable } from "@nestjs/common";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ServiceData } from "src/models";
import { HometaxTaxProvider } from "src/modules/user/hometax/hometax.tax.provider";
import { parseDashDate } from "src/utils/date";
import { DateRangeDto } from "../dto/date.range.dto";
import { PaginationDto } from "../dto/pagination.dto";
import { TaxDateTypeDto } from "./dto/tax.date.type.dto";
import { TaxTypeDto } from "./dto/tax.type.dto";

@Injectable()
export class TaxService {

  constructor(
    private readonly hometaxPvd : HometaxTaxProvider
  ){}

  public async taxDate(
    business : UserBusiness,
    date : DateRangeDto,
    type : number
  ) : Promise<ServiceData>{
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const taxDay = await this.hometaxPvd.taxDate(
        business ,
        startDate,
        `${endDate} 23:59:59`,
        type
      )
      if(taxDay) {
        return ServiceData.ok(
          'Successfully getting bills',
          {
            bills : taxDay
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async taxList(
    business : UserBusiness,
    date : DateRangeDto,
    type : TaxTypeDto,
    dateType : TaxDateTypeDto,
    page : PaginationDto,
    word : string | null = null
  ) : Promise<ServiceData> {
    try {
      const startDate =  date.start_date ? parseDashDate(date.start_date) : null;
      const endDate = date.end_date ? parseDashDate(date.end_date) : null;
      const taxList = this.hometaxPvd.taxList(
        business ,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        type,
        dateType,
        page,
        word
      );

      const total = this.hometaxPvd.rangeSum(
        business ,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        type,
        dateType,
        page,
        word
      )
      if(taxList) {
        return ServiceData.ok(
          'Successfully getting bill list',
          {
            total : await total,
            bills : await taxList
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}