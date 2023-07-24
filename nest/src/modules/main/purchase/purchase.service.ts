import { Injectable } from '@nestjs/common';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { ServiceData } from 'src/models';
import { CrefiaPurchaseProvider } from 'src/modules/user/crefia/crefia.purchase.provider';
import { parseDashDate } from 'src/utils/date';
import { CardListDto } from '../dto/card.list.dto';
import { DateRangeDto } from '../dto/date.range.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { CardSalesDto } from './dto/card.sales.dto';

@Injectable()
export class PurchaseService {

  constructor(
    private readonly purchasePvd : CrefiaPurchaseProvider,
  ){}

  async purchaseDate(
    business : UserBusiness,
    query : DateRangeDto,
    type : number,
    list : CardListDto | null = null
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(query.start_date);
      const endDate = parseDashDate(query.end_date);
      const dayPurchase = await this.purchasePvd.dayPurchase(
        business,
        startDate,
        `${endDate} 23:59:59`, // datetime range
        type,
        list
      )
      if(dayPurchase) {
        return ServiceData.ok(
          'Successfully getting day purchases',
          {
            purchases : dayPurchase
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async purchaseList(
    business : UserBusiness,
    query : DateRangeDto,
    card : CardListDto,
    page : PaginationDto
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(query.start_date);
      const endDate = parseDashDate(query.end_date);
      const purchases = this.purchasePvd.dayPurchaseList(
        business,
        startDate,
        `${endDate} 23:59:59`, // datetime range
        card,
        page
      )
      const total = await this.purchasePvd.rangeSum(
        business,
        startDate,
        `${endDate} 23:59:59`, // datetime range
        card,
        null
      )
      if(purchases && total) {
        return ServiceData.ok(
          'Succsesfully getting card list',
          {
            total : total['total'],
            sumCnt : total['sumCnt'],
            purchases : await purchases
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async purchaseSearch(
    business : UserBusiness,
    date : DateRangeDto,
    card : CardListDto,
    page : PaginationDto,
    word : string
  ) : Promise<ServiceData> {
    try {
      const startDate =  date.start_date ? parseDashDate(date.start_date) : null;
      const endDate = date.end_date ? parseDashDate(date.end_date) : null;
      const purchases = this.purchasePvd.dayPurchaseList(
        business,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        card,
        page,
        word
      )
      const total = await this.purchasePvd.rangeSum(
        business,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        card,
        word
      )
      if(purchases) {
        return ServiceData.ok(
          'Successfully getting cards',
          {
            total : total['total'],
            sumCnt : total['sumCnt'],
            purchases : await purchases
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async detaailPurchase(
    business : UserBusiness,
    query : CardSalesDto
  ) : Promise<ServiceData> {
    try {
      const data = await this.purchasePvd.findByApprCardNoTradeDate(business, query);
      if(data) {
        return ServiceData.ok(
          'Successfully getting detail purchase',
          {
            result : data
          },
          2101
        )
      }
      return ServiceData.ok(
        'Cannot found detail purchase',
        {
          result : {
            payAmt : null,
            payDt : null,
            comm : null,
          },
        },
        2102
      );
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
