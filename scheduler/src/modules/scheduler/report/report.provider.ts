import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BusinessReport } from "src/entities/booster/user/report.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { CreateReportVO } from "./vo/create.report.vo";

@Injectable()
export class ReportProvider {

  constructor(
    @InjectRepository(BusinessReport)
    private readonly reportRepo : Repository<BusinessReport>,
    private readonly datasource : DataSource
  ){}

  public async createReport(
    business : UserBusiness,
    vo : CreateReportVO
  ) : Promise<void> {
    const queryRunner : QueryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const report = await this.reportRepo.create({
        business : business,
          type : vo.type,
          sales : vo.sales,
          before_sales : vo.before_sales,
          expected_deposit : vo.expeced_deposit,
          date : vo.date,
          percent : vo.percent
      })
      await queryRunner.manager.save(report);
      
      await queryRunner.commitTransaction();
      
    } catch(e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally { 
      await queryRunner.release();
    }
  }
}