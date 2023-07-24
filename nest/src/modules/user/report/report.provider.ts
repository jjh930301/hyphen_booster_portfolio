
import { Injectable } from "@nestjs/common";
import { InjectRepository} from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { BusinessReport } from "src/entities/booster/user/report.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { PaginationDto } from "src/modules/main/dto/pagination.dto";
import { Repository , DataSource } from "typeorm";
import { CreateReportVO } from "./vo/create.report.vo";

@Injectable()
export class ReportProvider {

  constructor(
    @InjectRepository(BusinessReport)
    private readonly reportRepo : Repository<BusinessReport>,
    private readonly datasource : DataSource
  ){}

  public async findOne(id : string) : Promise<BusinessReport> {
    try {
      return await this.reportRepo.createQueryBuilder(SchemaNames.business_report)
        .select([
          `${SchemaNames.business_report}.id as id`,
          `${SchemaNames.business_report}.type as type`,
          `${SchemaNames.business_report}.before_sales as before_sales`,
          `${SchemaNames.business_report}.sales as sales`,
          `${SchemaNames.business_report}.expected_deposit as expected_deposit`,
          `${SchemaNames.business_report}.expenditure as expenditure`,
          `${SchemaNames.business_report}.deposit as deposit`,
          `${SchemaNames.business_report}.percent as percent`,
          `${SchemaNames.business_report}.business as business`,
          `${SchemaNames.business_report}.date as date`,
          `${SchemaNames.business_report}.created_at as created_at`,
        ])
        .where(`${SchemaNames.business_report}.id = :id` , {
          id : id
        })
        .getRawOne()
    } catch(e) {
      return null;
    }
  }

  public async updateOne(id : string , vo : CreateReportVO) {
    try {
      await this.reportRepo.createQueryBuilder(SchemaNames.business_report)
        .update(BusinessReport)
        .set({
          sales : vo.sales,
          before_sales : vo.before_sales,
          expected_deposit : vo.expeced_deposit,
          percent : vo.percent
        })
        .where(`${SchemaNames.business_report}.id = :id` , {
          id : id
        })
        .execute()
    } catch(e) {
      console.log(e)
    }
  }

  public async reports(
    business : UserBusiness,
    page : PaginationDto,
    type : number
  ) {
    try {
      const query = this.reportRepo.createQueryBuilder(SchemaNames.business_report)
        .select()
        .where(`business = :business` , {
          business : business.id
        })
      if(type) {
        query.andWhere(`${SchemaNames.business_report}.type = :type` , {
          type : type
        })
      }
      return await query.orderBy(`created_at` , 'DESC')
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
        .getMany();
    } catch(e) {
      console.log(e)
      return null;
    }
  }

  public async createReport(
    business : UserBusiness,
    vo : CreateReportVO
  ) : Promise<void> {
    try {
      await this.reportRepo.create({
        business : business,
          type : vo.type,
          sales : vo.sales,
          before_sales : vo.before_sales,
          expected_deposit : vo.expeced_deposit,
          date : vo.date,
          percent : vo.percent
      })
      
    } catch(e) {
      return null;
    }
  }
}