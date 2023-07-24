import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BankHistory } from "src/entities/booster/user/bank.history.entity";
import { BusinessBank } from "src/entities/booster/user/business.bank.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { parseColonTime, parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class BankHistoryProvider {
  constructor(
    @InjectRepository(BankHistory)
    private readonly historyRepo : Repository<BankHistory>
  ){}

  public async upsert(
    business : UserBusiness,
    bank : BusinessBank,
    data : any
  ) {
    try {
      const obj : QueryDeepPartialEntity<BankHistory> = {
        business : business,
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
}