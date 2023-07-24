import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CardApprBatch } from "src/entities/interpos/cardappr.batch.entity";
import { PurchaseBatch } from "src/entities/interpos/purchase.batch.entity";
import { CardCode, CardCodeObj } from "src/enums/card.code";
import { SelectHelper } from "src/helpers/select/select.helper";
import { Brackets, Repository } from "typeorm";
import { DayDto } from "../home/dto/day.dto";

@Injectable()
export class CardApprBatchProvider {
	static models = [
		CardApprBatch,
	]

	constructor(
		@InjectRepository(CardApprBatch)
		private readonly cardapprRepo : Repository<CardApprBatch>
	) {}

	public async calendar(
		businessNumber : string,
		startDate : string,
		endDate : string,
		dayDto : DayDto
	) : Promise<CardApprBatch[]> {
		try {
			const query = await this.cardapprRepo.createQueryBuilder(SchemaNames.card_appr_batch)
        .select([
          `DATE_FORMAT(${SchemaNames.card_appr_batch}.appr_date , '%Y%m%d') AS trDt`,
					`SUM(
            CASE 
              WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'N' 
              THEN -${SchemaNames.card_appr_batch}.appr_amount 
              WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'Y' 
              THEN ${SchemaNames.card_appr_batch}.appr_amount
            ELSE 0 END) AS trSumAmt`,
					`COUNT(*) AS trSumCnt`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'Y' 
              THEN ${SchemaNames.card_appr_batch}.appr_amount 
            ELSE 0 END) AS apprSumAmt`,
					`COUNT(
						IF(
							${SchemaNames.card_appr_batch}.appr_yn='Y', 
							${SchemaNames.card_appr_batch}.appr_yn, 
							null
						)
					) AS apprSumCnt`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'N' 
              THEN -${SchemaNames.card_appr_batch}.appr_amount 
            ELSE 0 END) AS canSumAmt`,
					`COUNT(
							IF(
								${SchemaNames.card_appr_batch}.appr_yn='N', 
								${SchemaNames.card_appr_batch}.appr_yn, 
								null
							)
						) AS canSumCnt`,
        ])
        .where(`${SchemaNames.card_appr_batch}.biz_no = :id` , {
          id : businessNumber
        })
        .andWhere(`${SchemaNames.card_appr_batch}.appr_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })

			if(typeof(dayDto.card_code) === 'string' && dayDto.card_code !== '') {
				query.andWhere(`${SchemaNames.card_appr_batch}.bscis_code = :card_code`, {
					card_code: dayDto.card_code
				})
			}
			if(typeof(dayDto.card_code) === 'object' && dayDto.card_code.length !== 0) {
				let orString = '';
				dayDto.card_code.forEach((c , i) => {
					if(i === 0 ) {
						orString += `${SchemaNames.card_appr_batch}.bscis_code = '${c}' `;
					} else {
						orString += `OR ${SchemaNames.card_appr_batch}.bscis_code = '${c}' `;
					}
				})
				query.andWhere(`(${orString})`)
			}
			if(dayDto.appr_yn === "Y" || dayDto.appr_yn === "N") {
				query.andWhere(`${SchemaNames.card_appr_batch}.appr_yn = :yn` , {
					yn : dayDto.appr_yn
				})
			}

			// total
			return query
				.groupBy('trDt')
				.orderBy('trDt' , 'ASC')
				.getRawMany();
		} catch(e) {
			console.log(e)
			return null;
		}
	}
	
	public async detail(
		businessNumber : string,
		startDate : string,
		endDate : string,
		dayDto : DayDto,
	) : Promise<CardApprBatch[]> {
		try {
			// case condition
			let whenString = ``;
			Object.keys(CardCodeObj).forEach((obj) => {
				whenString += SelectHelper.whenCardCondition(
					SchemaNames.card_appr_batch , 
					'bscis_code',
					CardCodeObj[obj]['code'] , 
					CardCodeObj[obj]['name'])
			})
			
			const query = await this.cardapprRepo.createQueryBuilder(SchemaNames.card_appr_batch)
				.select([
					`DATE_FORMAT(${SchemaNames.card_appr_batch}.appr_date , '%Y%m%d') AS trDt`, //승인일자
					`DATE_FORMAT(${SchemaNames.card_appr_batch}.appr_time , '%h%i%s') AS trTm`, //승인시간
					`IF(
						${SchemaNames.card_appr_batch}.appr_yn = 'Y',
						'승인',
						'취소'
					) AS trDiv`, // 카드승인
					`CASE 
						${whenString}
					ELSE '알 수 없음' END AS cardCorp1`, // 발급사 코드
					`${SchemaNames.card_appr_batch}.card_no AS cardNum`, // 카드번호
					`${SchemaNames.card_appr_batch}.appr_no AS apprNo`, // 승인번호
					`${SchemaNames.card_appr_batch}.appr_amount AS apprAmt`, // 승인금액
					`CASE
						WHEN ${SchemaNames.card_appr_batch}.installment = 0 THEN '일시불' 
						WHEN ${SchemaNames.card_appr_batch}.installment > 0 THEN CONCAT(${SchemaNames.card_appr_batch}.installment,'개월')
					ELSE '알 수 없음' END AS instDiv`,
					`${SchemaNames.card_appr_batch}.member_no AS merNo`,
					`IF(
						${SchemaNames.card_appr_batch}.installment < 10,
						CONCAT(0,${SchemaNames.card_appr_batch}.installment),
						${SchemaNames.card_appr_batch}.installment
					) AS insTrm` // 할부기간
				])
				.where(`${SchemaNames.card_appr_batch}.biz_no = :id` , {
          id : businessNumber
        })
        .andWhere(`${SchemaNames.card_appr_batch}.appr_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
			if (dayDto.word !== "" && dayDto.word) {
				query.andWhere(
					`CONCAT(${SchemaNames.card_appr_batch}.appr_no , ${SchemaNames.card_appr_batch}.appr_amount) LIKE :word` , {
					word : `%${dayDto.word}%`
				})
			}
			
			if(typeof(dayDto.card_code) === 'string' && dayDto.card_code !== '') {
				query.andWhere(`${SchemaNames.card_appr_batch}.bscis_code = :card_code`, {
					card_code: dayDto.card_code
				})
			}
			if(typeof(dayDto.card_code) === 'object' && dayDto.card_code.length !== 0) {
				let orString = '';
				dayDto.card_code.forEach((c , i) => {
					if(i === 0 ) {
						orString += `${SchemaNames.card_appr_batch}.bscis_code = '${c}' `;
					} else {
						orString += `OR ${SchemaNames.card_appr_batch}.bscis_code = '${c}' `;
					}
				})
				query.andWhere(`(${orString})`)
			}

			if(dayDto.appr_yn === "Y" || dayDto.appr_yn === "N") {
				query.andWhere(`${SchemaNames.card_appr_batch}.appr_yn = :yn` , {
					yn : dayDto.appr_yn
				})
			}

			// detail 
			return query
				.orderBy('trDt' , 'ASC')
				.addOrderBy('trTm' , 'ASC')
				.getRawMany();
		} catch(e) {
			console.log(e);
			return null
		}
	}

	public async monthTotal(
		businessNumber : string,
		startDate : string,
		endDate : string
	) : Promise<CardApprBatch[]> {
		try {
			return await this.cardapprRepo.createQueryBuilder(SchemaNames.card_appr_batch)
				.select([
					`DATE_FORMAT(${SchemaNames.card_appr_batch}.appr_date , '%Y%m') AS trDt`,
					`SUM(
						CASE 
							WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'N' 
							THEN -${SchemaNames.card_appr_batch}.appr_amount 
							WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'Y' 
							THEN ${SchemaNames.card_appr_batch}.appr_amount
						ELSE 0 END) AS trSumAmt`,
					`COUNT(*) AS trSumCnt`,
					`SUM(
						CASE 
							WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'Y' 
							THEN ${SchemaNames.card_appr_batch}.appr_amount 
						ELSE 0 END) AS apprSumAmt`,
					`COUNT(
						IF(
							${SchemaNames.card_appr_batch}.appr_yn='Y', 
							${SchemaNames.card_appr_batch}.appr_yn, 
							null
						)
					) AS apprSumCnt`,
					`SUM(
						CASE 
							WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'N' 
							THEN -${SchemaNames.card_appr_batch}.appr_amount 
						ELSE 0 END) AS canSumAmt`,
					`COUNT(
							IF(
								${SchemaNames.card_appr_batch}.appr_yn='N', 
								${SchemaNames.card_appr_batch}.appr_yn, 
								null
							)
						) AS canSumCnt`,
				])
				.where(`${SchemaNames.card_appr_batch}.biz_no = :id` , {
          id : businessNumber
        })
        .andWhere(`${SchemaNames.card_appr_batch}.appr_date BETWEEN :start_date AND :end_date` , {
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

	/*
	"trDt": "202205",
	"cardCorp": "KB카드",
	"trSumAmt": "6876000",
	"trSumCnt": "164",
	"apprSumAmt": "6876000",
	"apprSumCnt": "164",
	"canSumAmt": "0",
	"canSumCnt": "0",
	*/
	public async monthCards(
		businessNumber : string,
		startDate : string,
		endDate : string
	) : Promise<CardApprBatch[]> {
		try {
			let whenString = ``;
			Object.keys(CardCodeObj).forEach((obj) => {
				whenString += SelectHelper.whenCardCondition(
					SchemaNames.card_appr_batch , 
					'bscis_code',
					CardCodeObj[obj]['code'] , 
					CardCodeObj[obj]['name']
				)
			})
			return await this.cardapprRepo.createQueryBuilder(SchemaNames.card_appr_batch)
				.select([
					`DATE_FORMAT(${SchemaNames.card_appr_batch}.appr_date , '%Y%m') AS trDt`, // 승인 일자
					`CASE 
						${whenString}
						ELSE '알 수 없음' END AS cardCorp`, // 발급사 코드
					`SUM(
            CASE 
              WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'N' 
              THEN -${SchemaNames.card_appr_batch}.appr_amount 
              WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'Y' 
              THEN ${SchemaNames.card_appr_batch}.appr_amount
            ELSE 0 END) AS trSumAmt`,
					`COUNT(*) AS trSumCnt`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'Y' 
              THEN ${SchemaNames.card_appr_batch}.appr_amount 
            ELSE 0 END) AS apprSumAmt`,
					`COUNT(
						IF(
							${SchemaNames.card_appr_batch}.appr_yn='Y', 
							${SchemaNames.card_appr_batch}.appr_yn, 
							null
						)
					) AS apprSumCnt`,
          `SUM(
            CASE 
              WHEN ${SchemaNames.card_appr_batch}.appr_yn = 'N' 
              THEN -${SchemaNames.card_appr_batch}.appr_amount 
            ELSE 0 END) AS canSumAmt`,
					`COUNT(
							IF(
								${SchemaNames.card_appr_batch}.appr_yn='N', 
								${SchemaNames.card_appr_batch}.appr_yn, 
								null
							)
						) AS canSumCnt`,
				])
				.where(`${SchemaNames.card_appr_batch}.biz_no = :id` , {
          id : businessNumber
        })
        .andWhere(`${SchemaNames.card_appr_batch}.appr_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
				.groupBy('cardCorp')
				.getRawMany();
		} catch(e) {
			return null;	
		}
	}
}