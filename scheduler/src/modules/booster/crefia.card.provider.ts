import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { CrefiaPurchase } from "src/entities/booster/crefia/crefia.purchase.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CardCompany } from "src/enums/card.code";
import { ReportType } from "src/enums/user/report/report.type";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { DayDto } from "../home/dto/day.dto";

@Injectable()
export class CrefiaCardProvider {
  static models = [
    CrefiaCard
  ];
  constructor(
    @InjectRepository(CrefiaCard)
    private readonly cardRepo : Repository<CrefiaCard>
  ){}

  private async calcCommission(
    apprAmt : number,
    code : string,
    cardCorp : string,
    rates : Array<Object>
  ) : Promise<number> {
    let comm : number = apprAmt;
    rates.forEach((rate) => {
      //카드사 명과 신용카드일 경우
      if(rate['cardNm'] === cardCorp && code === '신용') {
        comm = Math.floor((Number(rate['sinYongFeeRate']) * 0.01) * apprAmt)
      }
    })
    if(comm === apprAmt) return comm = comm * 0.01
    return comm;
  }

  public async upsert(
    business : UserBusiness,
    data : any,
    rates : Array<Object>
  ) {
    try {
      const obj : QueryDeepPartialEntity<CrefiaCard>= {
        business : business,
        pk_date : `${parseDashDate(data['trDt'])}`,
        trade_date : `${parseDashDate(data['trDt'])} ${parseColonTime(data['trTm'])}`,
        trade_division : data['trDiv'] === '승인' ? 1 : 2,
        commission : await this.calcCommission(
          Number(data['apprAmt']),
          data['cardKnd'],
          data['cardCorp1'],
          rates
        ),
        card_company : data['cardCorp1'] ? data['cardCorp1'] : '',
        card_code : CardCompany[data['cardCorp1']] ? CardCompany[data['cardCorp1']] : 0,
        card_alliance : data['cardCorp2'],
        card_no : data['cardNum'],
        approval_no : data['apprNo'],
        approval_amount : data['trDiv'] === '승인' ? 
          Number(data['apprAmt']) : 
          Math.abs(Number(data['apprAmt'])),
        inst_division : data['instDiv'] === '0 개월' ? '일시불' : data['instDiv'],
        member_no : data['merNo'],
        card_kind_code : Number(data['cardKndCd']),
        card_kind : data['cardKnd'],
        card_real_no : data['cardRealNo'],
        inst : data['insTrm'] === '00' ? 0 : Number(data['insTrm'])
      }
      await this.cardRepo.createQueryBuilder()
        .insert()
        .into(CrefiaCard)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'business',
            'pk_date',
            'trade_division',
            'approval_no',
          ],
          overwrite: [
            'trade_date',
            'commission',
            'card_company',
            'card_code',
            'card_alliance',
            'card_no',
            'approval_amount',
            'inst_division',
            'member_no',
            'card_kind_code',
            'card_kind',
            'card_real_no',
            'inst',
          ]
        })
        .execute();
    } catch(e) {
      console.log(e);
    }
  }

  public async dayCard(
		businessNumber : string,
		startDate : string,
		endDate : string,
		dayDto : DayDto,
    appr_yn : string
	) : Promise<CrefiaCard[]> {
		try {
			const query = await this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `DATE_FORMAT(${SchemaNames.crefia_card}.trade_date , '%Y%m%d') AS trDt`,
					`SUM(
            CASE 
              WHEN ${SchemaNames.crefia_card}.trade_division = 2 
              THEN -${SchemaNames.crefia_card}.approval_amount 
              WHEN ${SchemaNames.crefia_card}.trade_division = 1 
              THEN ${SchemaNames.crefia_card}.approval_amount
            ELSE 0 END) AS trSumAmt`,
					`COUNT(*) AS trSumCnt`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.crefia_card}.trade_division = 1 
              THEN ${SchemaNames.crefia_card}.approval_amount 
            ELSE 0 END) AS apprSumAmt`,
					`COUNT(
						IF(
							${SchemaNames.crefia_card}.trade_division = 1, 
							${SchemaNames.crefia_card}.trade_division, 
							null
						)
					) AS apprSumCnt`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.crefia_card}.trade_division = 2 
              THEN -${SchemaNames.crefia_card}.approval_amount 
            ELSE 0 END) AS canSumAmt`,
					`COUNT(
							IF(
								${SchemaNames.crefia_card}.trade_division = 2, 
								${SchemaNames.crefia_card}.trade_division, 
								null
							)
						) AS canSumCnt`,
        ])
        .leftJoin(`${SchemaNames.crefia_card}.business` , 'business')
        .where(`business.business_number = :id` , {
          id : businessNumber
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })

			if(typeof(dayDto.card_code) === 'string' && dayDto.card_code !== '') {
				query.andWhere(`${SchemaNames.crefia_card}.card_company = :card_code`, {
					card_code: dayDto.card_code
				})
			}
			if(typeof(dayDto.card_code) === 'object' && dayDto.card_code.length !== 0) {
				let orString = '';
				dayDto.card_code.forEach((c , i) => {
					if(i === 0 ) {
						orString += `${SchemaNames.crefia_card}.card_company = '${c}' `;
					} else {
						orString += `OR ${SchemaNames.crefia_card}.card_company = '${c}' `;
					}
				})
				query.andWhere(`(${orString})`)
			}
			if(appr_yn === "Y" || appr_yn === "N") {
				query.andWhere(`${SchemaNames.crefia_card}.trade_division = :yn` , {
					yn : appr_yn === 'Y' ? 1 : 2
				})
			}

			// total
			return query
				.groupBy('trDt')
				.orderBy('trDt' , 'ASC')
				.getRawMany();
		} catch(e) {
			return null;
		}
	}
  public async updateCommission(data : any) {
    try {
      await this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .update(CrefiaCard)
        .set({
          commission : data['commSum']
        })
        .where(`date_format(trade_date , '%Y-%m-%d') = :trade_date` , {trade_date : parseDashDate(data['trDt'])})
        .andWhere('card_no = :card_no' , {card_no : data['cardNum']})
        .andWhere('approval_no = :apprNo' , {apprNo : data['apprNo']} )
        .andWhere('member_no = :memNo' , {memNo : data['merNo']})
        .andWhere('trade_division = :trDiv' , {trDiv : data['trDiv'] === '승인' ? 1 : 2})
        .execute();
    } catch(e) {
      console.log('Failure update commission');
    }
  }

  public async findCancelOne(
    business : UserBusiness,
    data : any
  ) : Promise<CrefiaCard[]> {
    try {
      const query = this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `${SchemaNames.crefia_card}.approval_no AS approval_no`,
          `${SchemaNames.crefia_card}.trade_date AS trade_date`,
          `${SchemaNames.crefia_card}.card_no AS card_no`,
          `${SchemaNames.crefia_card}.card_company AS card_company`,
          `${SchemaNames.crefia_card}.card_alliance AS card_aliance`,
          `${SchemaNames.crefia_card}.approval_amount AS approval_amount`,
          `${SchemaNames.crefia_card}.commission AS commission`,
          `${SchemaNames.crefia_card}.inst_division AS inst_division`,
          `${SchemaNames.crefia_card}.member_no AS member_no`,
        ])
        .where(`business = :bizNo` , {
          bizNo : business.id
        })
        .andWhere(`approval_no = :apprNo` , {
          apprNo : data['apprNo']
        })
        .andWhere(`card_no = :cardNo` , {
          cardNo : data['cardNum']
        })
        .getRawMany();
        
      return await query
    } catch(e) {
      return null
    }
  }


  public async salesSum(
    business : UserBusiness,
    startDate : string ,
    endDate : string,
    type : number,
  ) {
    try {
      const format = {
        [ReportType.day] : '%Y-%m-%d',
        [ReportType.month] : '%Y-%m'
      }
      return await this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `SUM(${SchemaNames.crefia_card}.approval_amount) total`,
          `DATE_FORMAT(${SchemaNames.crefia_card}.trade_date , '${format[type]}') AS date`,
        ])
        .where(`${SchemaNames.crefia_card}.business = :business` , {
          business : business.id
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_division = :div` , {
          div : 1
        })
        .groupBy('date')
        .orderBy('trade_date' , 'DESC')
        .getRawMany()
    } catch(e) {
      return null;
    }
  }

  public async updateComm(purchase : CrefiaPurchase) {
    try {
      await this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .update(CrefiaCard)
        .set({
          commission : Number(purchase.commission_sum)
        })
        .where(`${SchemaNames.crefia_card}.business = :biz` , {biz : purchase.business})
        .andWhere(`DATE_FORMAT(${SchemaNames.crefia_card}.trade_date , '%Y-%m-%d') = '${purchase.trade_date}'`)
        .andWhere(`card_no = :card_no` , {card_no : purchase.card_no})
        .andWhere(`approval_no = :apprNo` , {apprNo : purchase.approval_no} )
        .andWhere(`commission = 0`)
        .execute();
    } catch(e) {
      console.log(e)
    }
  }

  public async kakaoSum(
    business : UserBusiness,
    startDate : string ,
    endDate : string,
    type : number,
  ) {
    try {
      const format = {
        [ReportType.day] : '%Y-%m-%d',
        [ReportType.month] : '%Y-%m'
      }
      return await this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `SUM(
            CASE 
              WHEN ${SchemaNames.crefia_card}.trade_division = 1 
              THEN ${SchemaNames.crefia_card}.approval_amount 
              WHEN ${SchemaNames.crefia_card}.trade_division = 2 
              THEN -${SchemaNames.crefia_card}.approval_amount 
            ELSE 0 END) total`,
          `DATE_FORMAT(${SchemaNames.crefia_card}.trade_date , '${format[type]}') AS date`,
        ])
        .where(`${SchemaNames.crefia_card}.business = :business` , {
          business : business.id
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy('date')
        .getRawOne()
    } catch(e) {
      console.log(e)
      return null;
    }
  }
}