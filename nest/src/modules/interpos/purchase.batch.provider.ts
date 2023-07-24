import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { PurchaseBatch } from "src/entities/interpos/purchase.batch.entity";
import { CardCodeObj } from "src/enums/card.code";
import { SelectHelper } from "src/helpers/select/select.helper";
import { DataSource, Repository } from "typeorm";
import { DayDto } from "../home/dto/day.dto";

@Injectable()
export class PurchaseBatchProvider {
  static models = [
    PurchaseBatch
  ]

  constructor(
    @InjectRepository(PurchaseBatch)
    private readonly purchaseRepo : Repository<PurchaseBatch>,
    private readonly datasource : DataSource
  ) {}

  //deprecated
  public async purchaseTotal(
    businessNumber : string,
		startDate : string,
		endDate : string,
    yn : string
  ) {
    try {

      let whenString = ``;
			Object.keys(CardCodeObj).forEach((obj) => {
				whenString += SelectHelper.whenCardCondition(
          SchemaNames.purchase_batch , 
          'card_code',
          CardCodeObj[obj]['code'] , 
          CardCodeObj[obj]['name']
        )
			})

      const detail = await this.purchaseRepo.createQueryBuilder(SchemaNames.purchase_batch)
        .select([
          `DATE_FORMAT(${SchemaNames.purchase_batch}.receipt_date , '%Y%m%d') AS trDt`,
          `DATE_FORMAT(${SchemaNames.purchase_batch}.sales_date , '%Y%m%d') AS buyDt`,
          `${SchemaNames.purchase_batch}.appr_no AS apprNo`,
          `DATE_FORMAT(${SchemaNames.purchase_batch}.payment_date , '%Y%m%d') AS payDt`,
          `${SchemaNames.purchase_batch}.fees AS commSum`,
          `${SchemaNames.purchase_batch}.purchase_appr_yn AS purchase_appr_yn`,
          `${SchemaNames.purchase_batch}.termid AS merNo`,
          `${SchemaNames.purchase_batch}.card_no AS cardNum`,
          `${SchemaNames.purchase_batch}.card_code AS cardDivCd`,
          `CASE 
            ${whenString}
            ELSE '알 수 없음' END AS cardDiv`, // 발급사 코드
          `${SchemaNames.purchase_batch}.transaction_amount AS payAmt`,
          `${SchemaNames.purchase_batch}.transaction_amount AS buyAmt`,
        ])
        .leftJoin(`${SchemaNames.purchase_batch}.termid` , 'purchases')
        .where(`purchases.biz_no = :bizno` , {
          bizno : businessNumber
        })
        .andWhere(`${SchemaNames.purchase_batch}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
        // .groupBy('commSum')
        .groupBy('payDt')
        .addGroupBy('apprNo')
      // .getRawMany();
      const query = this.datasource.createQueryBuilder()
        .select([
          `tab.payDt AS buyDt`, // 승인 일자
          `SUM(
            CASE 
              WHEN tab.purchase_appr_yn = 'Y' 
              THEN tab.payAmt 
            ELSE 0 END) AS buySumAmt`,
          `COUNT(tab.purchase_appr_yn) AS buySumCnt`,
          `SUM(tab.commSum) AS commSum`,
          `(SUM(
            CASE 
              WHEN tab.purchase_appr_yn = 'Y' 
              THEN tab.payAmt 
            ELSE 0 END
          ) - SUM(tab.commSum)) as paySumAmt`
        ])
        .from(`(${detail.getQuery()})`, 'tab') // alias
        .setParameters(detail.getParameters())
        .groupBy('buyDt')
        .orderBy('buyDt' , 'ASC')
      const data : Object = {};
      data['total'] = await query.getRawMany();
      if (yn === 'Y') {
        data['details'] = await detail.getRawMany();
      } else {
        data['details'] = []
      }
      return data
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  /*
  trDt	거래일자
  buyDt	매입일자
  apprNo	승인번호
  cardCorp1	카드사명 :: 없음
  cardCorp2	제휴카드사명 :: 없음
  merNo	가맹점번호 termid
  cardKnd	카드구분 :: 없음
  cardNum	카드번호
  cardDivCd	카드종류코드 
  cardDiv	카드종류
  buyAmt	매입금액
  commMem	수수료 가맹점 :: 없음
  commPoint	수수료 포인트 :: 없음
  commEtc	수수료 기타 :: 없음
  commSum	수수료 계 :: 없음
  commVat	부가세 대리납부 금액 :: 없음
  payAmt	지급금액
  payDt	지급예정일
  */
  public async dayTotal(
    businessNumber : string,
		startDate : string,
		endDate : string,
		cardDayDto : DayDto
  ) : Promise<PurchaseBatch[]>{
    try {

      const query = await this.purchaseRepo.createQueryBuilder(SchemaNames.purchase_batch)
        .select([
          `DATE_FORMAT(${SchemaNames.purchase_batch}.payment_date , '%Y%m%d') AS buyDt`,
          `SUM(
            ${SchemaNames.purchase_batch}.transaction_amount
            ) AS buySumAmt`,
          `COUNT(*) AS buySumCnt`,
          `SUM(
            ${SchemaNames.purchase_batch}.fees
            ) AS commSum`,
          `SUM(
            ${SchemaNames.purchase_batch}.transaction_amount - ${SchemaNames.purchase_batch}.fees
          ) AS paySumAmt`,
        ])
        .where(`${SchemaNames.purchase_batch}.biz_no = :id` , {
          id : businessNumber
        })
        .andWhere(`${SchemaNames.purchase_batch}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if(typeof(cardDayDto.card_code) === 'string' && cardDayDto.card_code !== '') {
        query.andWhere(`${SchemaNames.purchase_batch}.card_code = :card_code`, {
          card_code: cardDayDto.card_code
        })
      }
      if(typeof(cardDayDto.card_code) === 'object' && cardDayDto.card_code.length !== 0) {
        let orString = '';
        cardDayDto.card_code.forEach((c , i) => {
          if(i === 0 ) {
            orString += `${SchemaNames.purchase_batch}.card_code = '${c}' `;
          } else {
            orString += `OR ${SchemaNames.purchase_batch}.card_code = '${c}' `;
          }
        })
        query.andWhere(`(${orString})`)
      }
      if(cardDayDto.appr_yn === "Y" || cardDayDto.appr_yn === "N") {
        query.andWhere(`${SchemaNames.purchase_batch}.purchase_appr_yn = :yn` , {
          yn : cardDayDto.appr_yn
        })
      }
      // group
      return query
        .groupBy('buyDt')
        .orderBy('buyDt' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async dayDetail(
    businessNumber : string,
		startDate : string,
		endDate : string,
		cardDayDto : DayDto,
  ) {
    try {
      let whenString = ``;
			Object.keys(CardCodeObj).forEach((obj) => {
				whenString += SelectHelper.whenCardCondition(
          SchemaNames.purchase_batch , 
          'card_code',
          CardCodeObj[obj]['code'] , 
          CardCodeObj[obj]['name']
        )
			})

      const query = await this.purchaseRepo.createQueryBuilder(SchemaNames.purchase_batch)
        .select([
          `${SchemaNames.purchase_batch}.classification AS classification`,
          `DATE_FORMAT(${SchemaNames.purchase_batch}.sales_date , '%Y%m%d') AS trDt`,
          `DATE_FORMAT(${SchemaNames.purchase_batch}.receipt_date , '%Y%m%d') AS buyDt`,
          `${SchemaNames.purchase_batch}.appr_no AS apprNo`,
          `CASE 
            ${whenString}
            ELSE '알 수 없음' END AS cardCorp1`, // 발급사 코드
          `${SchemaNames.purchase_batch}.card_no AS cardNum`,
          `${SchemaNames.purchase_batch}.transaction_amount AS buyAmt`,
          `${SchemaNames.purchase_batch}.transaction_amount - ${SchemaNames.purchase_batch}.fees AS payAmt`,
          `DATE_FORMAT(${SchemaNames.purchase_batch}.payment_date , '%Y%m%d') AS payDt`,
          `${SchemaNames.purchase_batch}.termid AS merNo`,
          `${SchemaNames.purchase_batch}.fees AS commSum`,
        ])
        .where(`${SchemaNames.purchase_batch}.biz_no = :id` , {
          id : businessNumber
        })
        .andWhere(`${SchemaNames.purchase_batch}.sales_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if(typeof(cardDayDto.card_code) === 'string' && cardDayDto.card_code !== '') {
        query.andWhere(`${SchemaNames.purchase_batch}.card_code = :card_code`, {
          card_code: cardDayDto.card_code
        })
      }
      if(typeof(cardDayDto.card_code) === 'object' && cardDayDto.card_code.length !== 0) {
        let orString = '';
        cardDayDto.card_code.forEach((c , i) => {
          if(i === 0 ) {
            orString += `${SchemaNames.purchase_batch}.card_code = '${c}' `;
          } else {
            orString += `OR ${SchemaNames.purchase_batch}.card_code = '${c}' `;
          }
        })
        query.andWhere(`(${orString})`)
      }
      if(cardDayDto.appr_yn === "Y" || cardDayDto.appr_yn === "N") {
        query.andWhere(`${SchemaNames.purchase_batch}.purchase_appr_yn = :yn` , {
          yn : cardDayDto.appr_yn
        })
      }
      // detail
      return query
        .orderBy('buyDt' , 'ASC')
        .getRawMany();
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async monthTotal(
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) : Promise<PurchaseBatch[]> {
    try {
      const query = await this.purchaseRepo.createQueryBuilder(SchemaNames.purchase_batch)
        .select([
          `DATE_FORMAT(${SchemaNames.purchase_batch}.payment_date , '%Y%m') AS trDt`, // 지급일자 기준
          `SUM(
            CASE
              WHEN ${SchemaNames.purchase_batch}.classification = '60' 
              THEN ${SchemaNames.purchase_batch}.transaction_amount
            ELSE 0 END) AS trSumAmt`,
          `COUNT(*) AS trSumCnt`,
          `(SUM(
						CASE 
							WHEN ${SchemaNames.purchase_batch}.classification = '60' 
							THEN ${SchemaNames.purchase_batch}.transaction_amount 
						ELSE 0 END) - SUM(${SchemaNames.purchase_batch}.fees)) AS dueSumAmt`,
					// `COUNT(
					// 	IF(
					// 		${SchemaNames.purchase_batch}.classification = '60', 
					// 		${SchemaNames.purchase_batch}.purchase_appr_yn, 
					// 		null
					// 	)
					// ) AS dueSumCnt`,
          `COUNT(*) AS dueSumCnt`,
          `SUM(${SchemaNames.purchase_batch}.fees) AS commFee`,
        ])
        .where(`${SchemaNames.purchase_batch}.biz_no = :id` , {
          id : businessNumber
        })
        .andWhere(`${SchemaNames.purchase_batch}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      return query
        .groupBy('trDt')
        .orderBy('trDt' , 'ASC')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }

  public async monthDetails(
    businessNumber : string,
    startDate : string,
    endDate : string,
  ) : Promise<PurchaseBatch[]> {
    try {
      let whenString = ``;
			Object.keys(CardCodeObj).forEach((obj) => {
				whenString += SelectHelper.whenCardCondition(
					SchemaNames.purchase_batch , 
					'card_code',
					CardCodeObj[obj]['code'] , 
					CardCodeObj[obj]['name']
				)
			})
      const query = await this.purchaseRepo.createQueryBuilder(SchemaNames.purchase_batch)
        .select([
          `DATE_FORMAT(${SchemaNames.purchase_batch}.sales_date , '%Y%m') AS trDt`, // 지급일자 기준
          `CASE 
						${whenString}
						ELSE '알 수 없음' END AS cardCorp`, // 발급사 코드
          `SUM(
            CASE
              WHEN ${SchemaNames.purchase_batch}.classification = '60' 
              THEN ${SchemaNames.purchase_batch}.transaction_amount
            ELSE 0 END) AS trSumAmt`,
          `COUNT(*) AS trSumCnt`,
          `SUM(
						CASE 
							WHEN ${SchemaNames.purchase_batch}.classification = '60' 
							THEN ${SchemaNames.purchase_batch}.transaction_amount 
						ELSE 0 END) - SUM(${SchemaNames.purchase_batch}.fees) AS dueSumAmt`,
					`COUNT(
						IF(
							${SchemaNames.purchase_batch}.classification = '60', 
							${SchemaNames.purchase_batch}.purchase_appr_yn, 
							null
						)
					) AS dueSumCnt`,
          `SUM(${SchemaNames.purchase_batch}.fees) AS commFee`,
        ])
        .where(`${SchemaNames.purchase_batch}.biz_no = :id` , {
          id : businessNumber
        })
        .andWhere(`${SchemaNames.purchase_batch}.payment_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      return query
        .groupBy('cardCorp')
        .getRawMany();
    } catch(e) {
      return null;
    }
  }
}