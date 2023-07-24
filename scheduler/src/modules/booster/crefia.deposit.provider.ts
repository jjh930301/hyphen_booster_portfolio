import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaDeposit } from "src/entities/booster/crefia/crefia.deposit.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CardCompany } from "src/enums/card.code";
import { ReportType } from "src/enums/user/report/report.type";
import { parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { DayDto } from "../home/dto/day.dto";

export class CrefiaDepositProvider {
  static models = [
    CrefiaDeposit
  ]

  constructor(
    @InjectRepository(CrefiaDeposit)
    private readonly depositRepo : Repository<CrefiaDeposit>
  ){}

  //confilic none
  public async insertDoNoting (
    business : UserBusiness,
    data : any
  ) : Promise<void> {
    try {
      const obj : QueryDeepPartialEntity<CrefiaDeposit> = {
        business : business,
        payment_date : parseDashDate(data['payDt']),
        card_company : data['cardCorp1'],
        card_code : CardCompany[data['cardCorp1']] ? CardCompany[data['cardCorp1']] : 0,
        member_no : data['memNo'],
        bank : data['bank'],
        account_no : data['acctNo'],
        sales_count : Number(data['salesCnt']),
        sales_amount : Number(data['salesAmt']),
        det_amount : Number(data['detAmt']),
        etc_amount : Number(data['etcAmt']),
        real_payment_amount : Number(data['realPayAmt']),
        commission_vat : Number(data['commVat'])
      };

      await this.depositRepo.createQueryBuilder()
        .insert()
        .into(CrefiaDeposit)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'business',
            'payment_date',
            'card_company',
            'card_code',
            'member_no',
            'bank',
            'account_no',
          ],
          overwrite : [
            'sales_count',
            'sales_amount',
            'det_amount',
            'etc_amount',
            'real_payment_amount',
            'commission_vat',
          ]
        })
        .execute()
    } catch(e) { /*on duplicated do noting*/ }
  }

  public async dayDeposit(
    businessNumber : string,
    startDate : string,
    endDate : string,
    dto : DayDto
  ) : Promise<CrefiaDeposit[]> {
    try {
      const query = await this.depositRepo.createQueryBuilder(SchemaNames.crefia_deposit)
        .select([
          `DATE_FORMAT(${SchemaNames.crefia_deposit}.payment_date , '%Y%m%d') AS payDt`,
          `SUM(
            ${SchemaNames.crefia_deposit}.sales_amount
          ) AS salesAmt`,
          `SUM(
            ${SchemaNames.crefia_deposit}.sales_count
          ) AS salesCnt`,
          `SUM(
            ${SchemaNames.crefia_deposit}.real_payment_amount
          ) AS realAmt`
        ])
        .leftJoin(`${SchemaNames.crefia_deposit}.business` , 'business')
        .where(`business.business_number = :id` , {
          id : businessNumber
        })
        .andWhere(`${SchemaNames.crefia_deposit}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if(typeof(dto.card_code) === 'string' && dto.card_code !== '') {
        query.andWhere(`${SchemaNames.crefia_deposit}.card_code = :card_code`, {
          card_code: dto.card_code
        })
      }
      if(typeof(dto.card_code) === 'object' && dto.card_code.length !== 0) {
        let orString = '';
        dto.card_code.forEach((c , i) => {
          if(i === 0 ) {
            orString += `${SchemaNames.crefia_deposit}.card_company = '${c}' `;
          } else {
            orString += `OR ${SchemaNames.crefia_deposit}.card_company = '${c}' `;
          }
        })
        query.andWhere(`(${orString})`)
      }
      return query
        .groupBy('payDt')
        .orderBy('payDt' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async depositDate(
    business : UserBusiness,
    date : string,
    type : number
  ) : Promise<CrefiaDeposit[]> {
    try {
      const obj = {
        0 : '%Y-%m-%d', //day
        1 : '%Y-%m' //month
      }
      const query = await this.depositRepo.createQueryBuilder(SchemaNames.crefia_deposit)
        .select([
          `DATE_FORMAT(${SchemaNames.crefia_deposit}.payment_date , '${obj[type]}') AS payDt`,
          `SUM(
            ${SchemaNames.crefia_deposit}.sales_amount
          ) AS salesAmt`,
          `SUM(
            ${SchemaNames.crefia_deposit}.sales_count
          ) AS salesCnt`,
          `SUM(
            ${SchemaNames.crefia_deposit}.real_payment_amount
          ) AS realAmt`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`DATE_FORMAT(${SchemaNames.crefia_deposit}.payment_date  , '${obj[type]}') = :date` , {
          date : date,
        })
      return query.groupBy('payDt').orderBy('payDt' , 'ASC').getRawOne();
      
    } catch(e) {
      return null;
    }
  }

  public async kakaoDepositDate(
    business : UserBusiness,
    date : string,
    type : number
  ) : Promise<CrefiaDeposit[]> {
    try {
      const format = {
        [ReportType.day] : '%Y-%m-%d', //day
        [ReportType.month] : '%Y-%m' //month
      }
      const query = await this.depositRepo.createQueryBuilder(SchemaNames.crefia_deposit)
        .select([
          `SUM(
            ${SchemaNames.crefia_deposit}.sales_amount
          ) AS salesAmt`,
          `SUM(
            ${SchemaNames.crefia_deposit}.sales_count
          ) AS salesCnt`,
          `SUM(
            ${SchemaNames.crefia_deposit}.real_payment_amount
          ) AS realAmt`,
          `${SchemaNames.crefia_deposit}.card_code AS card_code`,
          `${SchemaNames.crefia_deposit}.card_company AS card_company`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        if (type === ReportType.month) {
          query.andWhere(`DATE_FORMAT(${SchemaNames.crefia_deposit}.payment_date  , '${format[type]}') = :date` , {
            date : date,
          })
        } else {
          query.andWhere(`${SchemaNames.crefia_deposit}.payment_date = :date` , {
            date : date,
          })
        }
        
      return query.groupBy('card_code').getRawMany();
      
    } catch(e) {
      return null;
    }
  }
}