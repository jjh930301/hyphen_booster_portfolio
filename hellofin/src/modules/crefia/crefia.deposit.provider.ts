import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { CrefiaDeposit } from "src/entities/booster/crefia/crefia.deposit.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { CardCompany } from "src/enums/card.code";
import { parseDashDate } from "src/utils/date";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class CrefiaDepositProvider {
  constructor(
    @InjectRepository(CrefiaDeposit)
    private readonly depositRepo : Repository<CrefiaDeposit>
  ){}

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
}