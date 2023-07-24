import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { BankHistory } from "src/entities/booster/user/bank.history.entity";
import { BusinessBank } from "src/entities/booster/user/business.bank.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { SelectHelper } from "src/helpers/select/select.helper";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class BankHistoryProvider {
  constructor(
    @InjectRepository(BankHistory)
    private readonly historyRepo : Repository<BankHistory>,
  ){}

  public async upsert(
    business : UserBusiness,
    bank : BusinessBank,
    data : any
  ) {
    try {
      const obj : QueryDeepPartialEntity<BankHistory> = {
        business : business.id as unknown as UserBusiness,
        bank : bank.id as unknown as BusinessBank,
        trade_date : `${parseDashDate(data['trDt'])} ${parseColonTime(data['trTm'])}`,
        trade_turnover : data['trRnd'] ? data['trRnd'] : null,
        trade_month : data['wlbn'] ? data['wlbn'] : null,
        in_amount : Number(data['inAmt']) ? Number(data['inAmt']) : 0,
        out_amount : Number(data['outAmt']) ? Number(data['outAmt']) : 0,
        balance : Number(data['balance']) ? Number(data['balance']) : 0,
        trade_branch : data['trBr'] ? data['trBr'] : null,
        trade_name : data['trNm'] ? data['trNm'] : null,
        trade_desc : data['trTp'] ? data['trTp'] : null,
        trade_detail : data['trDetail'] ? data['trDetail'] : null,
        memo : data['memo'] ? data['memo'] : null,
        currency_code : data['curCd'] ? data['curCd'] : null,
        receive_account_no : data['recvAcctNo'] ? data['recvAcctNo'] : null,
        receive_account_holder : data['recvAcctHolder'] ? data['recvAcctHolder'] : null,
        send_account_no : data['sendAcctNo'] ? data['sendAcctNo'] : null,
        send_account_holder : data['sendAcctHolder'] ? data['sendAcctHolder'] : null,
      }
      await this.historyRepo.createQueryBuilder()
        .insert()
        .into(BankHistory)
        .values(obj)
        .orUpdate({
          conflict_target : [
            'bank',
            'trade_date'
          ],
          overwrite : [
            'trade_turnover',
            'trade_month',
            'in_amount',
            'out_amount',
            'balance',
            'trade_branch',
            'trade_name',
            'trade_desc',
            'trade_detail',
            'memo',
            'currency_code',
            'receive_account_no',
            'receive_account_holder',
            'send_account_no',
            'send_account_holder',
          ]
        })
        .execute()
    } catch(e) {
      console.log(e);
    }
  }

  public async historyCalendar(
    business : UserBusiness,
    startDate : string,
    endDate : string,
  ) : Promise<Array<BankHistory>> {
    try {
      return await this.historyRepo.createQueryBuilder(SchemaNames.bank_history)  
        .select([
          `DATE_FORMAT(${SchemaNames.bank_history}.trade_date , '%Y%m%d') AS trDt`,
          `SUM(
            CASE
              WHEN ${SchemaNames.bank_history}.in_amount != 0 
              THEN ${SchemaNames.bank_history}.in_amount
            ELSE 0 END
          ) as inAmt`,
          `SUM(
            CASE
              WHEN ${SchemaNames.bank_history}.out_amount != 0 
              THEN ${SchemaNames.bank_history}.out_amount
            ELSE 0 END
          ) as outAmt`,
        ])
        .where(`business = :bizId` , {
          bizId : business.id
        })
        .andWhere(`${SchemaNames.bank_history}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
        .groupBy('trDt')
        .orderBy('trDt' , 'ASC')
        .getRawMany()
    } catch(e) {
      console.log(e)
      return null;
    }
  }
  public async findByBiz(
    businessId : string , 
    startDate : string,
    endDate : string,
    key : string | null = null , 
    value : string | null = null
  ) : Promise<Array<BankHistory>> {
    try {
      const query = this.historyRepo.createQueryBuilder(SchemaNames.bank_history)
        .select(SelectHelper.bank_history_select)
        .leftJoin(`${SchemaNames.bank_history}.bank` , SchemaNames.business_bank)
        .where(`${SchemaNames.bank_history}.business = :businessId` , {businessId})
        .andWhere(`${SchemaNames.bank_history}.trade_date BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
					end_date : endDate
        })
      if (key) {
        query.andWhere(`${SchemaNames.bank_history}.${key} = :value` , {value})
        return await query.getRawMany();
      }
      return await query.orderBy('trade_date', 'DESC').getRawMany()
    } catch(e) {
      return null;
    }
  }
  public async findOneByBank(bankId : string) {
    try {
      return await this.historyRepo.createQueryBuilder(SchemaNames.bank_history)
        .select(SelectHelper.bank_history_select)
        .leftJoin(`${SchemaNames.bank_history}.bank` , SchemaNames.business_bank)
        .where(`${SchemaNames.bank_history}.bank = :bankId` , {bankId})
        .orderBy('trade_date' , 'DESC')
        .limit(1)
        .getRawOne()
    } catch(e) {
      console.log(e)
      return null;
    }
  }
}