import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaCard } from "src/entities/booster/crefia/crefia.card.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { DayDto } from "../../home/dto/day.dto";
import { CardListDto } from "../../main/dto/card.list.dto";
import { PaginationDto } from "../../main/dto/pagination.dto";
import { CardCompany, KstaCardCompany } from "src/enums/card.code";
import { CardApprDivDto } from "src/modules/main/sales/dto/card.appr.div.dto";
import { StatisticsSelectHelper } from "src/helpers/select/statistics.select.helper";
import { ReportType } from "src/enums/user/report/report.type";
import { CancelCardDto } from "src/modules/main/sales/dto/cancel.card.dto";
import { query } from "express";

@Injectable()
export class CrefiaCardProvider {
  static models = [
    CrefiaCard
  ];
  constructor(
    @InjectRepository(CrefiaCard)
    private readonly cardRepo : Repository<CrefiaCard>,
    @InjectRepository(UserBusiness)
    private readonly bizRepo : Repository<UserBusiness>,
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

  public async interposUpsert(
    data : any,
  ) {
    try {
      const business = await this.bizRepo.createQueryBuilder(SchemaNames.user_businesses)
        .select([
          `${SchemaNames.user_businesses}.id`,
          `${SchemaNames.user_businesses}.business_number`,
        ])
        .where(`${SchemaNames.user_businesses} = :bizNo` , {
          bizNo : data['biz_no'] // interpos 사업자 번호
        })
        .getOne()
      if(!business) {
        return;
      }
      // card_appr upsert
      const obj: QueryDeepPartialEntity<CrefiaCard> = {
        business : business,
        trade_date : `${data['appr_date']} ${data['appr_time']}`,
        trade_division : data['appr_yn'] === 'Y' ? 1 : 2,
        card_no : data['card_no'],
        approval_no : data['appr_no'],
        member_no : data['member_no'],
        // commission : await this.calcCommission(
        //   Number(data['apprAmt']),
        //   data['cardKnd'],
        //   data['cardCorp1'],
        //   rates
        // ),
        //(수정) 카드사만 수정
        card_company : KstaCardCompany[data['bscpr_code']]['name'] ? KstaCardCompany[data['bscpr_code']]['name'] : '알 수 없음',
        card_code : KstaCardCompany[data['bscpr_code']]['code'] ? KstaCardCompany[data['bscpr_code']]['code'] : 0,
        // card_alliance : data['cardCorp2'] ? data['cardCorp2'] : '',
        approval_amount : Number(data['appr_amount']) ? Number(data['appr_amount']) : 0,
        inst_division : data['installment'] === 0 ? '일시불' : `${data['installment']} 개월`,
        inst : data['installment']
        // card_kind_code : Number(data['cardKndCd']), 존재하지 않음
        // card_kind : data['cardKnd'], 존재하지 않음
        // card_real_no : data['cardRealNo'], 존재하지 않음
      }
      await this.cardRepo.createQueryBuilder()
        .insert()
        .into(CrefiaCard)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'trade_date',
            'trade_division',
            'card_no',
            'approval_no',
            'member_no',
          ],
          overwrite : [
            'card_company',
            'card_code',
            'approval_amount',
            'inst_division',
            'inst',
          ]
        })
    } catch(e) {
      return null;
    }
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
        approval_no : data['apprNo'],
        trade_division : data['trDiv'] === '승인' ? 1 : 2,
        trade_date : `${parseDashDate(data['trDt'])} ${parseColonTime(data['trTm'])}`,
        commission : await this.calcCommission(
          Number(data['apprAmt']),
          data['cardKnd'],
          data['cardCorp1'],
          rates
        ),
        card_company : data['cardCorp1'] ? data['cardCorp1'] : '',
        card_code : CardCompany[data['cardCorp1']] ? CardCompany[data['cardCorp1']] : 0,
        card_alliance : data['cardCorp2'] ? data['cardCorp2'] : '',
        card_no : data['cardNum'],
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
    }
  }

  public async cancelCard(
    id : string,
    dto : CancelCardDto
  ) : Promise<CrefiaCard> {
    try {
      const query = await this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `${SchemaNames.crefia_card}.trade_date`
        ])
        .where(`${SchemaNames.crefia_card}.business = :bizId` , {
          bizId : id
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_division = :div` , {
          div : 1
        })
        .andWhere(`${SchemaNames.crefia_card}.approval_no = :appr_no` , {
          appr_no : dto.appr_no
        })
        .andWhere(`${SchemaNames.crefia_card}.card_no = :card_no` , {
          card_no : dto.card_no
        })
      return query.getOne();
    } catch(e) {
      return null;
    }
  }

  public async dateStatistics(
    business : UserBusiness,
    type : number,
		startDate : string,
		endDate : string,
  ) : Promise<CrefiaCard[]> {
    try {
      const query = this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select(StatisticsSelectHelper.crefiaCardDate(SchemaNames.crefia_card , type))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy(`date`)
        .orderBy('date' , 'ASC')
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async timeStatistics(
    business : UserBusiness,
		startDate : string,
		endDate : string,
  ) : Promise<CrefiaCard[]> {
    try {
      const query = this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select(StatisticsSelectHelper.crefiaCardDayOrTime(SchemaNames.crefia_card , 0))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy(`time`)
        .orderBy('time' , 'ASC')
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async dayStatistics(
    business : UserBusiness,
    startDate : string,
    endDate : string
  ) : Promise<CrefiaCard[]> {
    try {
      const query = this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select(StatisticsSelectHelper.crefiaCardDayOrTime(SchemaNames.crefia_card , 1))
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
        .groupBy(`day`)
        .orderBy('day' , 'ASC')
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async calendar(
    business : UserBusiness,
		startDate : string,
		endDate : string,
  ) : Promise<CrefiaCard[]> {
    try {
      return await this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `DATE_FORMAT(${SchemaNames.crefia_card}.trade_date , '%Y%m%d') AS trDt`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.crefia_card}.trade_division = 1 
              THEN ${SchemaNames.crefia_card}.approval_amount 
              WHEN ${SchemaNames.crefia_card}.trade_division = 2 
              THEN -${SchemaNames.crefia_card}.approval_amount 
            ELSE 0 END) AS apprSumAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy('trDt')
        .orderBy('trDt' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async dateSum(
    business : UserBusiness,
    startDate : string,
    endDate : string
  ) {
    try {
      const query = this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `SUM(
            CASE 
              WHEN ${SchemaNames.crefia_card}.trade_division = 1 
              THEN ${SchemaNames.crefia_card}.approval_amount 
              WHEN ${SchemaNames.crefia_card}.trade_division = 2 
              THEN -${SchemaNames.crefia_card}.approval_amount 
            ELSE 0 END
          ) AS trSumAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      const data = await query.getRawOne();
      return await data['trSumAmt']
    } catch(e) {
      return null;
    }
  }

  public async dayCard(
		business : UserBusiness,
		startDate : string,
		endDate : string,
    type : number,
    list : CardListDto | null = null,
    div : CardApprDivDto | null = null,
	) : Promise<CrefiaCard[]> {
		try {
      let cards : Array<string> = null;
      if(list?.cards) {
        cards = JSON.parse(list.cards) as Array<string>
      }
			const query = this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          type === 0 
          ? `DATE_FORMAT(${SchemaNames.crefia_card}.trade_date , '%Y%m%d') AS trDt `
          : `${SchemaNames.crefia_card}.card_company as cardCorp1 `,
					`SUM(
            CASE 
              WHEN ${SchemaNames.crefia_card}.trade_division = 1 
              THEN ${SchemaNames.crefia_card}.approval_amount 
              WHEN ${SchemaNames.crefia_card}.trade_division = 2 
              THEN -${SchemaNames.crefia_card}.approval_amount 
            ELSE 0 END
          ) AS trSumAmt`,
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
              THEN ${SchemaNames.crefia_card}.approval_amount 
            ELSE 0 END) AS canSumAmt`,
					`COUNT(
							IF(
								${SchemaNames.crefia_card}.trade_division = 2, 
								${SchemaNames.crefia_card}.trade_division, 
								null
							)
						) AS canSumCnt`,
          `SUM(
            ${SchemaNames.crefia_card}.commission
          ) AS comm`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if(div?.appr_div) {
        query.andWhere(`${SchemaNames.crefia_card}.trade_division = :appr_div` , {
          appr_div : div.appr_div
        })
      }
      //카드사 선택
      if(cards !== null) {
        if(typeof(cards) === 'string' && cards !== '') {
          query.andWhere(`${SchemaNames.crefia_card}.card_code = :card_code`, {
            card_code: cards
          })
        }
        if(typeof(cards) === 'object' && cards?.length !== 0) {
          let orString = '';
          cards.forEach((c , i) => {
            if(i === 0 ) {
              orString += `${SchemaNames.crefia_card}.card_code = '${c}' `;
            } else {
              orString += `OR ${SchemaNames.crefia_card}.card_code = '${c}' `;
            }
          })
          query.andWhere(`(${orString})`)
        }
      }
      
      if(type === 0) {
        return await query.groupBy('trDt').orderBy('trDt' , 'ASC').getRawMany();
      }
      if(type === 1) {
        return await query.groupBy('cardCorp1').getRawMany();
      }
			return null;
		} catch(e) {
			return null;
		}
	}

  public async dayCardList(
    business : UserBusiness,
    startDate : string | null = null,
    endDate : string | null = null,
    card : CardListDto,
    page : PaginationDto,
    word : string | null = null,
    div : CardApprDivDto
  ) : Promise<CrefiaCard[]> {
    try {
      let cards : Array<string> = null;
      if(card?.cards) {
        cards = JSON.parse(card.cards) as Array<string>
      }
      const query = this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `trade_date AS trDt `, //거래시간
          `card_company as cardCorp1 `, //카드사
          `trade_division AS trDiv`, // 승인 , 취소
          `member_no AS memNo`, // 가맹점번호 
          'card_no AS cardNo', // 카드번호
          `approval_no AS apprNo`, // 승인번호
          `approval_amount AS apprAmt`, // 승인금액
          `commission AS comm`, // 수수료
          `origin_trade_date AS originTrDt`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
      if(word != null && typeof(Number(word)) === 'number') {
        const like = `
          ${SchemaNames.crefia_card}.approval_amount LIKE :word 
          OR ${SchemaNames.crefia_card}.approval_no LIKE :word 
        `
        query.andWhere(`(${like})` , {word : `%${word}%`})
      }

      if(startDate != null && endDate != null) {
        query.andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      }
      if(div.appr_div) {
        query.andWhere(`${SchemaNames.crefia_card}.trade_division = :appr_div` , {
          appr_div : Number(div.appr_div)
        })
      }
      //카드사 선택
      if(cards) {
        if(typeof(cards) === 'string' && cards !== '') {
          query.andWhere(`${SchemaNames.crefia_card}.card_code = :card_code`, {
            card_code: cards
          })
        }
        if(typeof(cards) === 'object' && cards?.length !== 0) {
          let orString = '';
          cards.forEach((c , i) => {
            if(i === 0 ) {
              orString += `${SchemaNames.crefia_card}.card_code = '${c}' `;
            } else {
              orString += `OR ${SchemaNames.crefia_card}.card_code = '${c}' `;
            }
          })
          query.andWhere(`(${orString})`)
        }
      }
      
      query
        .orderBy('trDt' , 'DESC')
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
    card : CardListDto,
    word : string | null = null,
    div : CardApprDivDto
  ) : Promise<CrefiaCard[]> {
    try {
      let cards : Array<string> = null;
      if(card?.cards) {
        cards = JSON.parse(card.cards) as Array<string>
      }
      const query = this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `SUM(${SchemaNames.crefia_card}.approval_amount) AS total`
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
      if(word != null && typeof(Number(word)) === 'number') {
        const like = `
          ${SchemaNames.crefia_card}.approval_amount LIKE :word 
          OR ${SchemaNames.crefia_card}.approval_no LIKE :word 
        `
        query.andWhere(`(${like})` , {word : `%${word}%`})
      }

      if(startDate != null && endDate != null) {
        query.andWhere(`${SchemaNames.crefia_card}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      if(div.appr_div) {
        query.andWhere(`${SchemaNames.crefia_card}.trade_division = :appr_div` , {
          appr_div : Number(div.appr_div)
        })
      }
      //카드사 선택
      if(cards) {
        if(typeof(cards) === 'string' && cards !== '') {
          query.andWhere(`${SchemaNames.crefia_card}.card_code = :card_code`, {
            card_code: cards
          })
        }
        if(typeof(cards) === 'object' && cards?.length !== 0) {
          let orString = '';
          cards.forEach((c , i) => {
            if(i === 0 ) {
              orString += `${SchemaNames.crefia_card}.card_code = '${c}' `;
            } else {
              orString += `OR ${SchemaNames.crefia_card}.card_code = '${c}' `;
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
        .execute();
    } catch(e) {
      console.log('Failure update commission');
    }
  }

  public async changed() {
    try {
      const cards = await this.cardRepo.find();
      cards.forEach(async card => {
        const business = await this.bizRepo.findOneBy({id : card.business.id});
        const obj : QueryDeepPartialEntity<CrefiaCard>= {
          business : business,
          trade_date : card.trade_date ,
          trade_division : card.trade_division ,
          commission : card.commission ,
          card_company : card.card_company ,
          card_code : CardCompany[card.card_company] ? CardCompany[card.card_company] : 0 ,
          card_alliance : card.card_alliance ,
          card_no : card.card_no ,
          approval_no : card.approval_no ,
          approval_amount : card.approval_amount ,
          inst_division : card.inst_division ,
          member_no : card.member_no ,
          card_kind_code : card.card_kind_code ,
          card_kind : card.card_kind ,
          card_real_no : card.card_real_no ,
          inst : card.inst ,
        }
        await this.cardRepo.createQueryBuilder()
          .insert()
          .into(CrefiaCard)
          .values(obj)
          .orUpdate({
            conflict_target : [
              'trade_date',
              'trade_division',
              'card_no',
              'approval_no',
              'member_no',
            ],
            overwrite: [
              'card_code'
            ]
          })
          .execute();
        
      })
    } catch(e) {
    }
  }

  public async findDiv(
    business : UserBusiness , 
    type : number
  ) : Promise<CrefiaCard[] | CrefiaCard> {
    try {
      const query = this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .select([
          `${SchemaNames.crefia_card}.approval_no AS approval_no`,
          `date_format(${SchemaNames.crefia_card}.trade_date , '%Y-%m-%d %H:%i:%s') AS trade_date`,
          `${SchemaNames.crefia_card}.card_no AS card_no`,
          `${SchemaNames.crefia_card}.card_company AS card_company`,
          `${SchemaNames.crefia_card}.card_code AS card_code`,
          `${SchemaNames.crefia_card}.card_alliance AS card_aliance`,
          `${SchemaNames.crefia_card}.card_real_no AS card_real_no`,
          `${SchemaNames.crefia_card}.approval_amount AS approval_amount`,
          `${SchemaNames.crefia_card}.inst_division AS inst_division`,
          `${SchemaNames.crefia_card}.member_no AS member_no`,
          `${SchemaNames.crefia_card}.card_real_no AS card_real_no`,
          `${SchemaNames.crefia_card}.card_kind AS card_kind`,
          `${SchemaNames.crefia_card}.card_kind_code AS card_kind_code`,
          `${SchemaNames.crefia_card}.inst AS inst`,
        ])
        .where(`business = :bizNo` , {
          bizNo : business.id
        })
        .andWhere(`trade_division = :type` , {
          type : type
        })
      return await query.getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async findCancelOne(
    business : UserBusiness,
    sales : CrefiaCard
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
          apprNo : sales.approval_no
        })
        .andWhere(`card_no = :cardNo` , {
          cardNo : sales.card_no
        })
        .getRawMany();
        
      return await query
    } catch(e) {
      return null
    }
  }

  public async reportSalesSum(
    business : string,
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
          business : business
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

  // 여신 계정 등록시 기존 데이터가 존재하는지 확인
  public async findRecentOne(business : UserBusiness) : Promise<CrefiaCard> {
    try {
      return await this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .where(`${SchemaNames.crefia_card}.business = :business` , {
          business : business.id
        })
        .orderBy('trade_date' , 'DESC')
        .limit(1)
        .getOne()
    } catch(e) {  
      return null;
    }
  }

  public async test(business : string) : Promise<CrefiaCard> {
    try {
      return await this.cardRepo.createQueryBuilder(SchemaNames.crefia_card)
        .where(`${SchemaNames.crefia_card}.business = :business` , {
          business : business
        })
        .orderBy('trade_date' , 'DESC')
        .limit(1)
        .getOne()
    } catch(e) {  
      return null;
    }
  }
}