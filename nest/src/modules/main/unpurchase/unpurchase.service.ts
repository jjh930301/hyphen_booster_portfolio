import { Injectable } from '@nestjs/common';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { ServiceData } from 'src/models';
import { CrefiaUnPurchaseProvider } from 'src/modules/user/crefia/crefia.unpurchase.provider';
import { parseDashDate, parseDate } from 'src/utils/date';
import { PaginationDto } from '../dto/pagination.dto';

@Injectable()
export class UnpurchaseService {
  constructor(
    private readonly unpurchasePvd : CrefiaUnPurchaseProvider
  ){}

  public async unpurhcase(
    business : UserBusiness,
    page : PaginationDto
  ) : Promise<ServiceData> {
    try {
      // 일주일 전
      const date = new Date(new Date().setDate(new Date().getDate() -7));
      const unpurchases = await this.unpurchasePvd.unpurchases(
        business,
        parseDashDate(parseDate(date)),
        page
      );
      if(unpurchases) {
        return ServiceData.ok(
          'Successfully getting unpurchases',
          {
            unpurchases
          },
          2101
        );
      }
      return ServiceData.serverError();
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
