import { Injectable } from "@nestjs/common";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { ServiceData } from "src/models";
import { HometaxCashSalesProvider } from "src/modules/user/hometax/hometax.cash.sales.provider";
import { parseDashDate } from "src/utils/date";
import { DateRangeDto } from "../../dto/date.range.dto";
import { PaginationDto } from "../../dto/pagination.dto";
import { TypeDto } from "../../dto/type.dto";

@Injectable()
export class CashSalesService {

  constructor(
    private readonly hometaxSalesPvd : HometaxCashSalesProvider
  ){}

  public async cashDate(
    business : UserBusiness,
    query : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(query.start_date);
      const endDate = parseDashDate(query.end_date);
      const cashDay = await this.hometaxSalesPvd.cashDate(
        business,
        startDate,
        `${endDate} 23:59:59`
      );
      if(cashDay) {
        return ServiceData.ok(
          'Successfully getting cash sales',
          {
            sales : cashDay
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async cashList(
    business : UserBusiness,
    date : DateRangeDto,
    page : PaginationDto,
    type : TypeDto,
    word : string | null = null
  ) : Promise<ServiceData> {
    try {
      const startDate =  date.start_date ? parseDashDate(date.start_date) : null;
      const endDate = date.end_date ? parseDashDate(date.end_date) : null;
      const cashList = this.hometaxSalesPvd.cashList(
        business,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        page,
        type,
        word
      )
      const total = this.hometaxSalesPvd.rangeSum(
        business,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        type,
        word
      )
      if(cashList) {
        return ServiceData.ok(
          'Successfully getting cash list',
          {
            total : await total,
            sales : await cashList
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