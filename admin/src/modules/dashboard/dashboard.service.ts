import { Injectable } from '@nestjs/common';
import { ServiceData } from 'src/models';
import { parseDashDate } from 'src/utils/date';
import { UserProvider } from '../user/user.provider';
import { UserBusinessProvider } from '../user/user.business.provider';
import { DateRangeDto } from './dto/date.range.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userPvd : UserProvider,
    private readonly businessPvd : UserBusinessProvider
  ) {}

  public async count(
    date : DateRangeDto
  ) : Promise<ServiceData> {
    try {
      let startDate = null;
      let endDate = null;
      if(date.end_date && date.start_date) {
        startDate = parseDashDate(date.start_date);
        endDate = parseDashDate(date.end_date);
      }
      const userCount = this.userPvd.count(
        startDate,
        `${endDate} 23:59:59`,
      );
      const bzCount = this.businessPvd.count(
        startDate,
        `${endDate} 23:59:59`,
      );

      if(userCount && bzCount) {
        return ServiceData.ok(
          'Successfully getting count',
          {
            user : await userCount,
            business : await bzCount 
          },
          2101
        );
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }
  
  public async countList(
    date : DateRangeDto,
    type : number
  ) : Promise<ServiceData> {
    try {
      let startDate = null;
      let endDate = null;
      if(date.end_date && date.start_date) {
        startDate = parseDashDate(date.start_date);
        endDate = parseDashDate(date.end_date);
      };
      let obj : Object = {};
      const crefiaCount = await this.businessPvd.countList(
        startDate , 
        `${endDate} 23:59:59`,
        type,
        'crefia'
      );
      crefiaCount.forEach(item => {
        if(item['date'] !== null) {
          obj[item['date']] = obj[item['date']] ? Number(obj[item['date']]) + Number(item['count']) : Number(item['count'])
        }
      })
      const hometaxCount = await this.businessPvd.countList(
        startDate , 
        `${endDate} 23:59:59`,
        type,
        'hometax'
      );
      hometaxCount.forEach(item => {
        if(item['date'] !== null) {
          obj[item['date']] = obj[item['date']] ? Number(obj[item['date']]) + Number(item['count']) : Number(item['count'])
        }
      })
      const baeminCount = await this.businessPvd.countList(
        startDate , 
        `${endDate} 23:59:59`,
        type,
        'baemin'
      )
      baeminCount.forEach(item => {
        if(item['date'] !== null) {
          obj[item['date']] = obj[item['date']] ? Number(obj[item['date']]) + Number(item['count']) : Number(item['count'])
        }
      })
      const yogiyoCount = await this.businessPvd.countList(
        startDate , 
        `${endDate} 23:59:59`,
        type,
        'yogiyo'
      )
      yogiyoCount.forEach(item => {
        if(item['date'] !== null) {
          obj[item['date']] = obj[item['date']] ? Number(obj[item['date']]) + Number(item['count']) : Number(item['count'])
        }
      })
      const coupangeCount = await this.businessPvd.countList(
        startDate , 
        `${endDate} 23:59:59`,
        type,
        'coupange'
      )
      coupangeCount.forEach(item => {
        if(item['date'] !== null) {
          obj[item['date']] = obj[item['date']] ? Number(obj[item['date']]) + Number(item['count']) : Number(item['count'])
        }
      })

      const user = this.userPvd.countList(
        startDate , 
        `${endDate} 23:59:59`,
        type,
      )
      const business = this.businessPvd.businessCountList(
        startDate , 
        `${endDate} 23:59:59`,
        type,
      )
      const connected = Promise.all(Object.keys(obj).map((item) => {
        return {
          count : String(obj[item]),
          date : item
        }
      })).then((result) => {
        return result
      })
      if(user && business) {
        return ServiceData.ok(
          'Successfully getting count list' , 
          {
            user : await user,
            business : await business,
            connected : await connected
          } , 
          2101
        );
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
