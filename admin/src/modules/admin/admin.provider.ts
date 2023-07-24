import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { AdminUser } from "src/entities/admin/admin.user.entity";
import { DataSource, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { RegistAdminDto } from "../auth/dto/regist.admin.dto";
import { MemberSearchDto } from "../member/dto/member.search.dto";
import { PaginationDto } from "../user/dto/pagination.dto";

@Injectable()
export class AdminProvider {

  static models = [
    AdminUser
  ]

  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepo : Repository<AdminUser>,
    private readonly datasource : DataSource
  ){}

  public async registAdmin(
    adminDto : RegistAdminDto,
    refreshToken : string
  ) {
    try {
      const admin : AdminUser = await this.adminRepo.create({
        user_id : adminDto.user_id,
        password : adminDto.password,
        email : adminDto.email,
        name : adminDto.name,
        type : adminDto.type,
        mobile : adminDto.mobile,
        refresh_token : refreshToken
      })

      const model = await this.adminRepo.findOneBy({id : admin.id});
      return model;
    } catch(e) {
      return null;
    }
  }

  public async updateUser(
    id : string,
    values : QueryDeepPartialEntity<AdminUser>
  ) {
    try {
      return await this.adminRepo.createQueryBuilder()
        .update(AdminUser)
        .set(values)
        .where(`${SchemaNames.admin_users}.id = :user_id` , {
          user_id : id
        })
        .execute()
    } catch(e) {
      return null;
    }
  }

  public async login(
    id : string
  ) : Promise<AdminUser> {
    try {
      return await this.adminRepo.createQueryBuilder(SchemaNames.admin_users)
        .select([
          `${SchemaNames.admin_users}.id`,
          `${SchemaNames.admin_users}.user_num`,
          `${SchemaNames.admin_users}.name`,
          `${SchemaNames.admin_users}.user_id`,
          `${SchemaNames.admin_users}.mobile`,
          `${SchemaNames.admin_users}.email`,
          `${SchemaNames.admin_users}.password`,
          `${SchemaNames.admin_users}.count`,
          `${SchemaNames.admin_users}.type`,
          `${SchemaNames.admin_users}.status`,
          `${SchemaNames.admin_users}.created_at`,
          `${SchemaNames.admin_users}.login_at`,
        ])
        .where(`${SchemaNames.admin_users}.user_id = :user_id` , {
          user_id : id
        })
        .getOne()
    } catch(e) {
      return null;
    }
  }

  public async findById(
    user_id : string,
    select : Array<string>
  ) : Promise<AdminUser> {
    try {
      return await this.adminRepo.createQueryBuilder(SchemaNames.admin_users)
        .select(select)
        .where(`${SchemaNames.admin_users}.user_id = :user_id` , {
          user_id : user_id
        })
        .getOne();
    } catch(e) {
      return null;
    }
  }

  public async findByNumId(
    id : number,
    select : Array<string>
  ) : Promise<AdminUser> {
    try {
      return await this.adminRepo.createQueryBuilder(SchemaNames.admin_users)
        .select(select)
        .where(`${SchemaNames.admin_users}.id = :id` , {
          id : id
        })
        .getOne();
    } catch(e) {
      return null;
    }
  }

  public async count(
    startDate : string,
    endDate : string,
    search : MemberSearchDto
  ) {
    try {
      const query = this.adminRepo.createQueryBuilder(SchemaNames.admin_users);
      if(startDate && endDate) {
        query.where(`${SchemaNames.admin_users}.created_at BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
        if(search.status === 0 || search.status === 1 || search.status === 2) {
          query.andWhere(`${SchemaNames.admin_users}.status = :status` , {
            status : search.status
          })
        }
        if(search.authority === 0 || search.authority === 1) {
          query.andWhere(`${SchemaNames.admin_users}.type = :type` , {
            type : search.authority
          })
        }
      }
      if(!startDate && !endDate) {
        if(search.status === 0 || search.status === 1 || search.status === 2) {
          query.andWhere(`${SchemaNames.admin_users}.status = :status` , {
            status : search.status
          })
        }
        if(search.authority === 0 || search.authority === 1) {
          query.andWhere(`${SchemaNames.admin_users}.type = :type` , {
            type : search.authority
          })
        }
      }
      if(search.type === 1 || search.type === 2 || search.type === 3 || search.type === 4) {
        const searchType = {
          1 : `user_id`,
          2 : `name`,
          3 : `mobile`,
          4 : `email`
        };
        query.where(`${SchemaNames.admin_users}.${searchType[search.type]} LIKE :word` , {
          word : `%${search.word}%`
        })
        if(search.status === 0 || search.status === 1 || search.status === 2) {
          query.andWhere(`${SchemaNames.admin_users}.status = :status` , {
            status : search.status
          })
        }
        if(search.authority === 0 || search.authority === 1) {
          query.andWhere(`${SchemaNames.admin_users}.type = :type` , {
            type : search.authority
          })
        }
      }
      return await query.getCount();
    } catch(e) {
      return null;
    }
  }

  public async admins(
    page : PaginationDto,
    startDate : string,
    endDate : string,
    search : MemberSearchDto
  ) {
    try {
      const query = this.adminRepo.createQueryBuilder(SchemaNames.admin_users)
        .select([
          `${SchemaNames.admin_users}.id`,
          `${SchemaNames.admin_users}.user_num`,
          `${SchemaNames.admin_users}.user_id`,
          `${SchemaNames.admin_users}.name`,
          `${SchemaNames.admin_users}.mobile`,
          `${SchemaNames.admin_users}.email`,
          `${SchemaNames.admin_users}.type`,
          `${SchemaNames.admin_users}.login_at`,
          `${SchemaNames.admin_users}.created_at`,
          `${SchemaNames.admin_users}.status`,
        ])
      if(startDate && endDate) {
        query.where(`${SchemaNames.admin_users}.created_at BETWEEN :start_date AND :end_date` , {
          start_date : startDate,
          end_date : endDate
        })
        if(search.status === 0 || search.status === 1 || search.status === 2) {
          query.andWhere(`${SchemaNames.admin_users}.status = :status` , {
            status : search.status
          })
        }
        if(search.authority === 0 || search.authority === 1) {
          query.andWhere(`${SchemaNames.admin_users}.type = :type` , {
            type : search.authority
          })
        }
      }
      if(!startDate && !endDate) {
        if(search.status === 0 || search.status === 1 || search.status === 2) {
          query.andWhere(`${SchemaNames.admin_users}.status = :status` , {
            status : search.status
          })
        }
        if(search.authority === 0 || search.authority === 1) {
          query.andWhere(`${SchemaNames.admin_users}.type = :type` , {
            type : search.authority
          })
        }
      }
      if(search.type === 1 || search.type === 2 || search.type === 3 || search.type === 4) {
        const searchType = {
          1 : `user_id`,
          2 : `name`,
          3 : `mobile`,
          4 : `email`
        };
        query.where(`${SchemaNames.admin_users}.${searchType[search.type]} LIKE :word` , {
          word : `%${search.word}%`
        })
        if(search.status === 0 || search.status === 1 || search.status === 2) {
          query.andWhere(`${SchemaNames.admin_users}.status = :status` , {
            status : search.status
          })
        }
        if(search.authority === 0 || search.authority === 1) {
          query.andWhere(`${SchemaNames.admin_users}.type = :type` , {
            type : search.authority
          })
        }
      }

      return await query
        .orderBy(`${SchemaNames.admin_users}.created_at` , 'DESC')
        .offset(Number(page.count) * Number(page.page))
        .limit(Number(page.count))
        .getMany();
    } catch(e) {
      return null;
    }
  }
}