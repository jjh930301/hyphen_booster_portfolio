import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { Inquiry } from "src/entities/booster/inquiry/inquiry.entity";
import { Repository, UpdateResult } from "typeorm";
import { AnswerDto } from "../inquiry/dto/answer.dto";
import { InquirySearchDto } from "../inquiry/dto/inquiry.search.dto";
import { PaginationDto } from "./dto/pagination.dto";

@Injectable()
export class InquiryProvider {
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepo : Repository<Inquiry>
  ){}

  public async count(
    search : InquirySearchDto,
    startDate : string,
    endDate : string,
  ) {
    try {
      const query = this.inquiryRepo.createQueryBuilder(SchemaNames.inquiries)
      if(search.status === 0 || search.status === 1 || search.status === 2) {
        query.andWhere(`${SchemaNames.inquiries}.status = :status` , {
          status : search.status
        })
      }
      if(search.type === 0 || search.type === 1 || search.type === 2 || search.type === 3 || search.type === 4) {
        query.andWhere(`${SchemaNames.inquiries}.type = :type` , {
          type : search.type
        })
      }
      if(startDate && endDate) {
        query.where(`${SchemaNames.inquiries}.created_at BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      return await query.getCount();
    } catch(e) {
      return null;
    }
  }

  public async inquiries(
    page : PaginationDto,
    search : InquirySearchDto,
    startDate : string,
    endDate : string,
  ) : Promise<Inquiry[]> {
    try {
      const query = this.inquiryRepo.createQueryBuilder(SchemaNames.inquiries)
        .select([
          `${SchemaNames.inquiries}.id`,
          `${SchemaNames.inquiries}.created_at`,
          `${SchemaNames.inquiries}.type`,
          `${SchemaNames.inquiries}.title`,
          `${SchemaNames.inquiries}.description`,
          `${SchemaNames.inquiries}.images`,
          `${SchemaNames.inquiries}.status`,
          `${SchemaNames.inquiries}.answer_admin`,
          `${SchemaNames.inquiries}.answer_title`,
          `${SchemaNames.inquiries}.answer_description`,
          `${SchemaNames.inquiries}.answered_at`,
          `${SchemaNames.users}.name`,
          `${SchemaNames.users}.mobile`,
          `${SchemaNames.users}.user_num`,
        ])
        .leftJoin(`${SchemaNames.inquiries}.user` , 'users')
      
      if(search.status === 0 || search.status === 1 || search.status === 2) {
        query.andWhere(`${SchemaNames.inquiries}.status = :status` , {
          status : search.status
        })
      }
      if(search.type === 0 || search.type === 1 || search.type === 2 || search.type === 3 || search.type === 4) {
        query.andWhere(`${SchemaNames.inquiries}.type = :type` , {
          type : search.type
        })
      }
      if(search.search_type === 1 || search.search_type === 2) {
        const searchType = {
          1 : `${SchemaNames.inquiries}.title LIKE :word`,
          2 : `${SchemaNames.users}.name LIKE :word`
        }
        query.andWhere(searchType[search.search_type] , {
          word : `%${search.word}%`
        })
      }
      if(startDate && endDate) {
        query.where(`${SchemaNames.inquiries}.created_at BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
      }
      return await query
        .orderBy(`${SchemaNames.inquiries}.created_at` , 'DESC')
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
        .getMany()
    } catch(e) {
      return null;
    }
  }

  public async findOne(id : string , select : Array<string>) {
    try {
      const query = this.inquiryRepo.createQueryBuilder(SchemaNames.inquiries)
        .select(select)
        .leftJoin(`${SchemaNames.inquiries}.user` , 'users')
        .where(`${SchemaNames.inquiries}.id = :id` , {
          id : id
        })
      return await query.getOne();
    } catch(e) {
      return null;
    }
  }

  public async findRawOne(id : string , select : Array<string>) : Promise<Inquiry> {
    try {
      return await this.inquiryRepo.createQueryBuilder(SchemaNames.inquiries)
        .select(select)
        .where(`${SchemaNames.inquiries}.id = :id` , {
          id : id
        })
        .getRawOne()
    } catch(e) {
      return null;
    }
  }

  public async updateAnswer(
    userId : string,
    body : AnswerDto
  ) : Promise<UpdateResult>{
    try {
      return await this.inquiryRepo.createQueryBuilder(SchemaNames.inquiries)
        .update(Inquiry)
        .set({
          answered_at : new Date(),
          answer_description : body.desc,
          answer_admin : userId,
          status : 2
        })
        .where(`${SchemaNames.inquiries}.id = :id` , {
          id : body.id
        })
        .execute()
    } catch(e) {
      return null;
    }
  }
}