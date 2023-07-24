import { Injectable } from '@nestjs/common';
import { ServiceData } from 'src/models';
import { CrefiaCardProvider } from 'src/modules/user/crefia/crefia.card.provider';
import { parseDashDate } from 'src/utils/date';
import { DateRangeDto } from '../dto/date.range.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { CardApprDivDto } from './dto/card.appr.div.dto';
import { CardListDto } from '../dto/card.list.dto';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { CancelCardDto } from './dto/cancel.card.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly cardPvd : CrefiaCardProvider,
  ) {}
  public async cancelCard(
    busienss : UserBusiness,
    query : CancelCardDto
  ) : Promise<ServiceData> {
    try {
      const card = await this.cardPvd.cancelCard(busienss.id , query)
      if(card) {
        return ServiceData.ok(
          "Successfully getting cancel card",
          {
            date : card.trade_date
          },
          2101
        )
      }
      return ServiceData.ok(
        "Cannot found card" , 
        {
          date : null
        },
        2101
      )
    } catch(e) {
      return ServiceData.serverError();
    }
  }
  public async dayCard(
    business : UserBusiness,
    query : DateRangeDto,
    type : number,
    list : CardListDto | null = null,
    div : CardApprDivDto | null = null,

  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(query.start_date);
      const endDate = parseDashDate(query.end_date);
      const cardDay = await this.cardPvd.dayCard(
        business,
        startDate,
        `${endDate} 23:59:59`, // datetime range,
        type,
        list,
        div
      )
      if(cardDay) {
        return ServiceData.ok(
          'Successfully getting day cards',
          {
            cards : cardDay
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async dayCardList(
    business : UserBusiness,
    query : DateRangeDto,
    card : CardListDto,
    page : PaginationDto,
    div : CardApprDivDto
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(query.start_date);
      const endDate = parseDashDate(query.end_date);
      const cardList = this.cardPvd.dayCardList(
        business,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        card,
        page,
        null,
        div
      )
      const total = this.cardPvd.rangeSum(
        business,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        card,
        null,
        div
      )
      if(cardList) {
        return ServiceData.ok(
          'Succsesfully getting card list',
          {
            total : await total,
            cards : await cardList
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async cardSearch(
    business : UserBusiness,
    date : DateRangeDto,
    card : CardListDto,
    page : PaginationDto,
    word : string,
    div : CardApprDivDto
  ) : Promise<ServiceData> {
    try {
      const startDate =  date.start_date ? parseDashDate(date.start_date) : null;
      const endDate = date.end_date ? parseDashDate(date.end_date) : null;
      const cards = await this.cardPvd.dayCardList(
        business,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        card,
        page,
        word,
        div
      )

      const total = this.cardPvd.rangeSum(
        business,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        card,
        word,
        div
      );
      if(cards) {
        return ServiceData.ok(
          'Successfully getting cards',
          {
            total : await total,
            cards : await cards
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      console.log(e)
      return ServiceData.serverError();
    }
  }
}
