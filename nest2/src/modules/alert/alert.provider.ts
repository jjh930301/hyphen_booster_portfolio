import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { Alert } from "src/entities/booster/user/alert.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { Repository } from "typeorm";
import { PaginationDto } from "./dto/pagination.dto";
import { CreateAlertVO } from "./vo/create.alert.vo";

@Injectable()
export class AlertProvider {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepo : Repository<Alert>
  ) {}

  public async createAlert(
    business : UserBusiness,
    data : CreateAlertVO
  ) : Promise<Alert> {
    try {
      return await this.alertRepo.create({
        business : business ? business : null,
        title : data.title,
        body : data.body,
        event : data.event ? data.event : null,
        event_type : data.event_type ? data.event_type : null,
        is_read : false,
        is_public : data.is_public
      }).save();
    } catch(e) {
      return null;
    }
  }

  /**
   * 알림 목록
   * @param device
   * @param business 
   * @param page 
   * @param type 
   * @returns 
   */
  public async alerts(
    business : UserBusiness,
    page : PaginationDto,
    type : number,
    device : UserDevice | null= null
  ) : Promise<Alert[]> {
    try {
      const query = this.alertRepo.createQueryBuilder(SchemaNames.alerts)
        .select()
        
        .where(`${SchemaNames.alerts}.business = :business` , {
          business : business.id
        })
      // 전체
      if(!type) {
        // const notInArray : Array<string> = [];
        // let notInString = ''
        // if(device.card_sales_approval_alert == false) notInArray.push(`${SchemaNames.alerts}.event_type NOT IN (11) `) // 카드 승인 포함
        // if(device.card_sales_cancel_alert == false) notInArray.push(`${SchemaNames.alerts}.event_type NOT IN (12) `) // 카드 승인취소 포함
        // if(device.cash_sales_approval_alert == false) notInArray.push(`${SchemaNames.alerts}.event_type NOT IN (13) `) // 현금 승인 포함
        // if(device.cash_sales_cancel_alert == false) notInArray.push(`${SchemaNames.alerts}.event_type NOT IN (14) `) // 현금 승인취소 포함
        
        // if(notInArray.length === 1) {
        //   notInString += `(${notInArray[0]})`
        //   query.andWhere(notInString);
        // } else if(notInArray.length >= 2) {
        //   Promise.all(notInArray.map((arr , i) => {
        //     if(i === 0) {
        //       notInString += `( ${arr}`
        //     } else if(i === notInArray.length -1) {
        //       notInString += `AND ${arr})`
        //     } else {
        //       notInString += `AND ${arr}`
        //     }
        //   }))
        //   query.andWhere(notInString)
        // }
        // 공지사항과 , open된 것만
        query
          // .orWhere(`
          //   ${SchemaNames.alerts}.event_type = 15 OR ${SchemaNames.alerts}.event_type = 16 OR ${SchemaNames.alerts}.event_type = 21 OR ${SchemaNames.alerts}.event_type = 22 OR ${SchemaNames.alerts}.event_type = 3
          // `)
          .orWhere(
            `
              ${SchemaNames.alerts}.is_public = :isPublic and 
              ${SchemaNames.alerts}.is_open = :isOpen
            ` , 
            {
              isPublic : true,
              isOpen : true
            }
          )
      }
      // 매출만
      if(type === 0) {
        const orArray : Array<string> = [];
        if(device.card_sales_approval_alert) orArray.push(`${SchemaNames.alerts}.event_type = 11 `) // 카드 승인 포함
        if(device.card_sales_cancel_alert) orArray.push(`${SchemaNames.alerts}.event_type = 12 `) // 카드 승인취소 포함
        if(device.cash_sales_approval_alert) orArray.push(`${SchemaNames.alerts}.event_type = 13 `) // 현금 승인 포함
        if(device.cash_sales_cancel_alert) orArray.push(`${SchemaNames.alerts}.event_type = 14 `) // 현금 승인취소 포함
        let orString : string = '';
        Promise.all(orArray.map((or , i) => {
          if(i === 0 ) {
            orString += or
          } else {
            orString += `OR ${or}`
          }
        }))
        query.where(`${SchemaNames.alerts}.business = :business` , {
          business : business.id
        })
        .andWhere(orString)
      }
      // 미매입 미입금 
      if(type === 1) {
        query.andWhere(`${SchemaNames.alerts}.event_type = 15 OR ${SchemaNames.alerts}.event_type = 16`)
      }
      if(type === 2) {
        query.andWhere(`${SchemaNames.alerts}.event_type = 21 OR ${SchemaNames.alerts}.event_type = 22`)
      }
      if(type === 3) {
        query.andWhere(`${SchemaNames.alerts}.event_type = 3`)
      }
      /**
       * 0 : 매출
       * 1 : 카드매출누락
       * 2 : 리포트
       * 3 : 문의답변
       * 4 : 공지사항
       */
      // 공지사항만 보기
      if(type === 4) {
        query.where(`${SchemaNames.alerts}.is_public = :isPublic` , {
          isPublic : true
        })
        .andWhere(`${SchemaNames.alerts}.is_open = :isOpen` , {
          isOpen : true
        })
      }
      query
        .orderBy(`${SchemaNames.alerts}.created_at` , `DESC`)
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
      return await query.getMany();
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  /**
   * 공지사항
   * @param page 
   * @returns 
   */
  public async notifications(page : PaginationDto) : Promise<Alert[]> {
    try {
      const query = this.alertRepo.createQueryBuilder(SchemaNames.alerts)
        .select([
          `${SchemaNames.alerts}.title AS title`,
          `${SchemaNames.alerts}.body AS body`,
          `${SchemaNames.alerts}.created_at AS created_at`,
          `${SchemaNames.alerts}.updated_at AS updated_at`
        ])
        .where(`${SchemaNames.alerts}.is_public = :isPublic` , {
          isPublic : true
        })
      query
        .orderBy(`${SchemaNames.alerts}.created_at` , `DESC`)
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
      return await query.getRawMany();
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async readAlert(id : string) {
    try {
      await this.alertRepo.createQueryBuilder()
        .update(Alert)
        .set({
          is_read : true
        })
        .where('id = :id' , {id : id})
        .execute();
    } catch(e) {
      return 
    }
  }
}