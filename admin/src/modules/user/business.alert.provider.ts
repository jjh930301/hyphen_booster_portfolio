import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { AdminUser } from "src/entities/admin/admin.user.entity";
import { Alert } from "src/entities/booster/user/alert.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { IsPush } from "src/enums/is.push";
import { Repository } from "typeorm";
import { AlertSearchDto } from "../notification/dto/alert.search.dto";
import { CreateAlertVO } from "../notification/vo/create.alert.vo";
import { PaginationDto } from "./dto/pagination.dto";

export class BusinessAlertProvider {

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepo : Repository<Alert>
  ) {}

  public async createAlert(
    data : CreateAlertVO,
    admin : AdminUser,
    push : number
  ) : Promise<Alert> {
    try {
      return await this.alertRepo.create({
        title : data.title,
        body : data.body,
        event : data.event ? data.event : null,
        event_type : data.event_type ? data.event_type : null,
        is_read : false,
        is_public : data.is_public,
        is_open : data.is_open,
        admin_id : admin ? admin.user_id : "하이픈부스터",
        pushed_at : push === 1 ? new Date() : null
      }).save();
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async createUserAlert(
    data : CreateAlertVO,
    business : UserBusiness
  ) {
    try {
      return await this.alertRepo.create({
        title : data.title,
        body : data.body,
        event : data.event ? data.event : null,
        event_type : data.event_type ? data.event_type : null,
        is_read : false,
        business : business,
        admin_id : null,
        pushed_at : null,
        is_open : true,
      }).save();
    } catch(e) {
      return null;
    }
  }

  public async findById(id) : Promise<Alert> {
    try {
      return await this.alertRepo.findOneBy({
        id : id
      })
    } catch(e) {
      return null;
    }
  }

  public async count(
    search : AlertSearchDto
  ) {
    try {
      const query = this.alertRepo.createQueryBuilder(SchemaNames.alerts)
        .andWhere(`${SchemaNames.alerts}.is_public = :isPublic` , {
          isPublic : 1
        })
      if(search.is_open === 0 || search.is_open === 1) {
        query.andWhere(`${SchemaNames.alerts}.is_open = :isOpen` , {
          isOpen : search.is_open
        })
      }
      if(search.push) {
        const obj = {
          [IsPush.push] : `pushed_at is not null`,
          [IsPush.unpush] : `pushed_at is null`
        }
        query.andWhere(obj[search.push])
      }
      if(search.word && search.type) {
        const obj = {
          1 : 'title',
          2 : 'admin_id'
        }
        query.andWhere(`${SchemaNames.alerts}.${obj[search.type]} LIKE :word `, {
          word : `%${search.word}%`
        })
      }
      return await query.getCount();
    } catch(e) {
      return null;
    }
  }

  public async findOne(id : string) {
    try {
      const query = this.alertRepo.createQueryBuilder(SchemaNames.alerts)
        .select([
          `${SchemaNames.alerts}.id`,
          `${SchemaNames.alerts}.title`,
          `${SchemaNames.alerts}.body`,
          `${SchemaNames.alerts}.event`,
          `${SchemaNames.alerts}.event_type`,
          `${SchemaNames.alerts}.is_public`,
          `${SchemaNames.alerts}.is_open`,
          `${SchemaNames.alerts}.is_read`,
          `${SchemaNames.alerts}.pushed_at`,
          `${SchemaNames.alerts}.admin_id`,
          `${SchemaNames.alerts}.created_at`,
          `${SchemaNames.alerts}.updated_at`,
          `${SchemaNames.alerts}.deleted_at`,
        ])
        .where(`${SchemaNames.alerts}.id = :id` , {
          id : id
        })
      return await query.getOne();
    } catch(e) {
      return null;
    }
  }

  public async findAllPublic(
    page : PaginationDto,
    search : AlertSearchDto
  ) : Promise<Alert[]> {
    try {
      const query = this.alertRepo.createQueryBuilder(SchemaNames.alerts)
        .select([
          `${SchemaNames.alerts}.id`,
          `${SchemaNames.alerts}.title`,
          `${SchemaNames.alerts}.body`,
          `${SchemaNames.alerts}.event`,
          `${SchemaNames.alerts}.event_type`,
          `${SchemaNames.alerts}.is_public`,
          `${SchemaNames.alerts}.is_open`,
          `${SchemaNames.alerts}.is_read`,
          `${SchemaNames.alerts}.pushed_at`,
          `${SchemaNames.alerts}.admin_id`,
          `${SchemaNames.alerts}.created_at`,
          `${SchemaNames.alerts}.updated_at`,
          `${SchemaNames.alerts}.deleted_at`,
        ])
        .andWhere(`${SchemaNames.alerts}.is_public = :isPublic` , {
          isPublic : 1
        })
      if(search.is_open === 0 || search.is_open === 1) {
        query.andWhere(`${SchemaNames.alerts}.is_open = :isOpen` , {
          isOpen : search.is_open
        })
      }
      if(search.push) {
        const obj = {
          [IsPush.push] : `pushed_at is not null`,
          [IsPush.unpush] : `pushed_at is null`
        }
        console.log(obj[search.push])
        query.andWhere(obj[search.push])
      }
      if(search.word && search.type) {
        const obj = {
          1 : 'title',
          2 : 'admin_id'
        }
        query.andWhere(`${SchemaNames.alerts}.${obj[search.type]} LIKE :word `, {
          word : `%${search.word}%`
        })
      }
      return await query
        .orderBy(`${SchemaNames.alerts}.created_at` , 'DESC')
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
        .getMany();
    } catch(e) {
      return null;
    }
  }
}