import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { Inquiry } from "src/entities/booster/inquiry/inquiry.entity";
import { User } from "src/entities/booster/user/user.entity";
import { DataSource, Repository } from "typeorm";
import { InquiryDto } from "./dto/inquiry.dto";
import { ModifyInquiryDto } from "./dto/modify.inquiry.dto";

@Injectable()
export class InquiryProvider {
  static models = [
    Inquiry
  ]
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepo : Repository<Inquiry>,
    private readonly datasource : DataSource
  ){}

  public async createInquiry(
    user : User,
    body : InquiryDto,
    images : string[]
  ) : Promise<Inquiry> {
    try {
      
      const inquiry = await this.inquiryRepo.create({
        type : body.type,
        title : body.title,
        description : body.description,
        status : 0,
        images : images ? images : [],
        user : user
      })
      return inquiry;
    } catch(e) {
      return null;
    }
  }
  public async findInquiry(id : string) {
    try {
      return await this.inquiryRepo.findOneBy({
        id : id
      })
    } catch(e) {
      return null;
    }
  }

  public async modifiedInquiry(
    body : ModifyInquiryDto,
    images : string[]
  ) {
    try {
      return await this.inquiryRepo.createQueryBuilder()
        .update(Inquiry)
        .set({
          title : body.title,
          description : body.description,
          type : body.type,
          images : images ? images : []
        })
        .where(`${SchemaNames.inquiries}.id = :id` , {
          id : body.id
        })
        .execute();
    } catch(e) {
      return null;
    }
  }

  public async findInquiries(
    user : User
  ) : Promise<Array<Inquiry>> {
    try {
      return await this.inquiryRepo.createQueryBuilder(SchemaNames.inquiries)
        .select()
        .where(`${SchemaNames.inquiries}.user = :user` , {
          user : user.id
        })
        .orderBy('updated_at' , 'DESC')
        .getMany();
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async deleteInquiry(
    inquiryId : string
  ) {
    try {
      return await this.inquiryRepo.delete({
        id : inquiryId
      })
    } catch(e) {
      return null;
    }
  }
}