import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaDeposit } from "src/entities/booster/crefia/crefia.deposit.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CardCompany } from "src/enums/card.code";
import { DepositStatusDto } from "src/modules/main/deposit/dto/deposit.status.dto";
import { CardListDto } from "src/modules/main/dto/card.list.dto";
import { PaginationDto } from "src/modules/main/dto/pagination.dto";
import { parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class CrefiaDepositProvider {
  static models = [
    CrefiaDeposit
  ]

  constructor(
    @InjectRepository(CrefiaDeposit)
    private readonly depositRepo : Repository<CrefiaDeposit>,
    @InjectRepository(UserBusiness)
    private readonly bizRepo : Repository<UserBusiness>,
  ){}

  //confilic none
  public async upsert (
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

  public async depositCalendar(
    business : UserBusiness,
    startDate : string,
    endDate : string
  ) {
    try {
      const query = this.depositRepo.createQueryBuilder(SchemaNames.crefia_deposit)
        .select([
          `DATE_FORMAT(${SchemaNames.crefia_deposit}.payment_date , '%Y%m%d') AS payDt`,
          `SUM(${SchemaNames.crefia_deposit}.real_payment_amount) AS payAmt`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.crefia_deposit}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy('payDt')
        .orderBy('payDt' , 'ASC')
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async depositDate(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    type : number
  ) : Promise<CrefiaDeposit[]> {
    try {
      const query = await this.depositRepo.createQueryBuilder(SchemaNames.crefia_deposit)
        .select([
          type === 0
          ?`DATE_FORMAT(${SchemaNames.crefia_deposit}.payment_date , '%Y%m%d') AS payDt`
          : `${SchemaNames.crefia_deposit}.card_company as cardCorp1 `,
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
        .andWhere(`${SchemaNames.crefia_deposit}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if(type === 0 ) {
        return query.groupBy('payDt').orderBy('payDt' , 'ASC').getRawMany();
      }
      if(type === 1) {
        return query.groupBy('cardCorp1').getRawMany()
      }
      return null;
    } catch(e) {
      return null;
    }
  }

  public async depositList(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    card : CardListDto,
    page : PaginationDto
  ) {
    try {
      let cards : Array<string> = null;
      if(card?.cards) {
        cards = JSON.parse(card.cards) as Array<string>
      }

      const query = this.depositRepo.createQueryBuilder(SchemaNames.crefia_deposit)
        .select([
          `DATE_FORMAT(${SchemaNames.crefia_deposit}.payment_date , '%Y%m%d') AS payDt`, 
          `${SchemaNames.crefia_deposit}.real_payment_amount AS realAmt`,
          `${SchemaNames.crefia_deposit}.sales_amount AS salesAmt`,
          // `${SchemaNames.crefia_deposit}.member_no AS memNo`,
          `${SchemaNames.crefia_deposit}.card_company AS cardCorp1`,
          `${SchemaNames.crefia_deposit}.bank AS bank`,
          `${SchemaNames.crefia_deposit}.account_no AS accountNo`,
          `${SchemaNames.crefia_deposit}.sales_count AS salesCnt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })

        if(startDate != null && endDate != null) {
          query.andWhere(`${SchemaNames.crefia_deposit}.payment_date BETWEEN :start_date AND :end_date` , {
            start_date : startDate,
            end_date : endDate
          })
        }

        if(cards) {
          //카드사 선택
          if(typeof(cards) === 'string' && cards !== '') {
            query.andWhere(`${SchemaNames.crefia_deposit}.card_code = :card_code`, {
              card_code: cards
            })
          }
          if(typeof(cards) === 'object' && cards.length !== 0) {
            let orString = '';
            cards.forEach((c , i) => {
              if(i === 0 ) {
                orString += `${SchemaNames.crefia_deposit}.card_code = '${c}' `;
              } else {
                orString += `OR ${SchemaNames.crefia_deposit}.card_code = '${c}' `;
              }
            })
            query.andWhere(`(${orString})`)
          }
        }

      query
        .orderBy('payDt' , 'DESC')
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async rangeSum(
    business : UserBusiness,
    startDate : string,
    endDate : string,
    card : CardListDto
  ) {
    try {
      let cards : Array<string> = null;
      if(card?.cards) {
        cards = JSON.parse(card.cards) as Array<string>
      }
      const query = this.depositRepo.createQueryBuilder(SchemaNames.crefia_deposit)
        .select([
          `SUM(${SchemaNames.crefia_deposit}.real_payment_amount) AS total` // 지급금액
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
      if(startDate != null && endDate != null) {
        query.andWhere(`${SchemaNames.crefia_deposit}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      if(cards) {
        //카드사 선택
        if(typeof(cards) === 'string' && cards !== '') {
          query.andWhere(`${SchemaNames.crefia_deposit}.card_code = :card_code`, {
            card_code: cards
          })
        }
        if(typeof(cards) === 'object' && cards.length !== 0) {
          let orString = '';
          cards.forEach((c , i) => {
            if(i === 0 ) {
              orString += `${SchemaNames.crefia_deposit}.card_code = '${c}' `;
            } else {
              orString += `OR ${SchemaNames.crefia_deposit}.card_code = '${c}' `;
            }
          })
          query.andWhere(`(${orString})`)
        }
      }
      const result = await query.getRawMany();
      return result[0]['total']
    } catch(e) {
      return null;
    }
  }

  public async findAnotherAmount(
    business : UserBusiness,
    card : CardListDto
  ) {
    try {
      let cards : Array<string> = null;
      if(card?.cards) {
        cards = JSON.parse(card.cards) as Array<string>
      }
      const query = this.depositRepo.createQueryBuilder(SchemaNames.crefia_deposit)
        .select([
          `DATE_FORMAT(${SchemaNames.crefia_deposit}.payment_date , '%Y-%m-%d') AS payDt`,
          `${SchemaNames.crefia_deposit}.card_company AS cardCorp1`,
          `CONVERT(${SchemaNames.crefia_deposit}.sales_count , CHAR) AS salesCnt`,
          `${SchemaNames.crefia_deposit}.member_no AS memNo`,
          `${SchemaNames.crefia_deposit}.bank AS bank`,
          `${SchemaNames.crefia_deposit}.account_no AS acctNo`,
          `${SchemaNames.crefia_deposit}.det_amount AS detAmt`,
          `${SchemaNames.crefia_deposit}.etc_amount AS etcAmt`,
          `${SchemaNames.crefia_deposit}.real_payment_amount AS realPayAmt`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`
          ${SchemaNames.crefia_deposit}.det_amount != 0 OR
          ${SchemaNames.crefia_deposit}.etc_amount != 0
        `)
        if(cards) {
          //카드사 선택
          if(typeof(cards) === 'string' && cards !== '') {
            query.andWhere(`${SchemaNames.crefia_deposit}.card_code = :card_code`, {
              card_code: cards
            })
          }
          if(typeof(cards) === 'object' && cards.length !== 0) {
            let orString = '';
            cards.forEach((c , i) => {
              if(i === 0 ) {
                orString += `${SchemaNames.crefia_deposit}.card_code = '${c}' `;
              } else {
                orString += `OR ${SchemaNames.crefia_deposit}.card_code = '${c}' `;
              }
            })
            query.andWhere(`(${orString})`)
          }
        }
      return await query.getRawMany();
    } catch(e) {
      return null
    }
  }

  // public async changedStatus(
  //   business : UserBusiness,
  //   body : DepositStatusDto
  // ) {
  //   try {
  //     return await this.depositRepo.createQueryBuilder()
  //       .update(CrefiaDeposit)
  //       .set({
  //         status : true
  //       })
  //       .where(`business = :bizId` , {
  //         bizId : business.id
  //       })
  //       .andWhere(`${SchemaNames.crefia_deposit}.payment_date = :date` , {
  //         date : body.payment_date
  //       })
  //       .andWhere(`${SchemaNames.crefia_deposit}.card_code = :code` , {
  //         code : body.card_code
  //       })
  //       .andWhere(`${SchemaNames.crefia_deposit}.status = :flag` , {
  //         flag : false
  //       })
  //       .execute();
  //   } catch(e) {
  //     return null;
  //   }
  // }

  public async changed() {
    try {
      const deposits = await this.depositRepo.find();
      deposits.forEach(async deposit => {
        const business = await this.bizRepo.findOneBy({id : deposit.business.id});
        const obj : QueryDeepPartialEntity<CrefiaDeposit> = {
          business : business,
          payment_date : deposit.payment_date,
          card_company : deposit.card_company,
          card_code : CardCompany[deposit.card_company] ? CardCompany[deposit.card_company] : 0,
          member_no : deposit.member_no,
          bank : deposit.bank,
          account_no : deposit.account_no,
          sales_count : deposit.sales_count,
          sales_amount : deposit.sales_amount,
          det_amount : deposit.det_amount,
          etc_amount : deposit.etc_amount,
          real_payment_amount : deposit.real_payment_amount,
          commission_vat : deposit.commission_vat
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
              'sales_count',
              'sales_amount',
              'det_amount',
              'etc_amount',
              'real_payment_amount',
              'commission_vat',
            ],
            overwrite : [
              'card_code'
            ]
          })
          .execute();
      })
    } catch(e) {
    }
  }

  public async findRecentOne(business : UserBusiness) : Promise<CrefiaDeposit> {
    try {
      return await this.depositRepo.createQueryBuilder(SchemaNames.crefia_deposit)
        .where(`${SchemaNames.crefia_deposit}.business = :business` , {
          business : business.id
        })
        .orderBy('payment_date' , 'DESC')
        .limit(1)
        .getOne()
    } catch(e) {  
      return null;
    }
  }

  public async reportDeepositDate(
    business : string,
    date : string | Date,
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
          bizId : business
        })
        .andWhere(`DATE_FORMAT(${SchemaNames.crefia_deposit}.payment_date  , '${obj[type]}') = :date` , {
          date : date,
        })
      return query.groupBy('payDt').orderBy('payDt' , 'ASC').getRawOne();
      
    } catch(e) {
      return null;
    }
  }

  // public async findGroupBy(
  //   business : UserBusiness,
  //   group : string
  // ) : Promise<CrefiaDeposit[]> {
  //   try {
  //     const query = this.depositRepo.createQueryBuilder(SchemaNames.crefia_deposit)
  //       .select([
  //         `DATE_FORMAT(${SchemaNames.crefia_deposit}.payment_date , '%Y%m%d') AS payDt`, 
  //         `SUM(
  //           ${SchemaNames.crefia_deposit}.real_payment_amount + ${SchemaNames.crefia_deposit}.det_amount
  //         ) AS paySumAmt`,
  //       ])
  //       .where(`business = :bizId` , {
  //         bizId : business.id
  //       })
  //     return await query.groupBy(group).getRawMany();
  //   } catch(e) {
  //     return null;
  //   }
  // }
}