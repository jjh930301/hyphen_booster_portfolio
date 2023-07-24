import { Injectable } from '@nestjs/common';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { ServiceData } from 'src/models';
import { CrefiaDepositProvider } from 'src/modules/user/crefia/crefia.deposit.provider';
import { CrefiaPurchaseProvider } from 'src/modules/user/crefia/crefia.purchase.provider';
import { parseDashDate } from 'src/utils/date';
import { CardListDto } from '../dto/card.list.dto';
import { DateRangeDto } from '../dto/date.range.dto';
import { PaginationDto } from '../dto/pagination.dto';

@Injectable()
export class DepositService {

  constructor(
    private readonly depositPvd : CrefiaDepositProvider,
  ){}
  async depositDate(
    business : UserBusiness,
    query : DateRangeDto,
    type : number
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(query.start_date);
      const endDate = parseDashDate(query.end_date);
      const dayDeposit = await this.depositPvd.depositDate(
        business,
        startDate,
        `${endDate} 23:59:59`, // datetime range
        type
      )
      if(dayDeposit) {
        return ServiceData.ok(
          'Successfully getting day purchases',
          {
            deposits : dayDeposit
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  async depositList(
    business : UserBusiness,
    date : DateRangeDto,
    card : CardListDto,
    page : PaginationDto
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const deposits = this.depositPvd.depositList(
        business,
        startDate,
        `${endDate} 23:59:59`, // datetime range
        card,
        page
      )

      const total = this.depositPvd.rangeSum(
        business,
        startDate,
        `${endDate} 23:59:59`, // datetime range
        card,
      )
      if(deposits && total) {
        return ServiceData.ok(
          'Successfully getting deposits',
          {
            total : await total,
            deposits : await deposits
          },
          2101
        )
      }
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async holdDeposit(
    business : UserBusiness,
    cards : CardListDto
  ) : Promise<ServiceData> {
    try {
      const hold = await this.depositPvd.findAnotherAmount(business , cards);
      if(hold) {
        return ServiceData.ok(
          'Succssfully getting hold deposits',
          {
            deposits : hold
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
