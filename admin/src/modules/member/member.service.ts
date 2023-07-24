import { Injectable } from '@nestjs/common';
import { SchemaNames } from 'src/constants/schema.names';
import { AdminUser } from 'src/entities/admin/admin.user.entity';
import { ServiceData } from 'src/models';
import { parseDashDate } from 'src/utils/date';
import { QueryPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AdminProvider } from '../admin/admin.provider';
import { DateRangeDto } from '../dashboard/dto/date.range.dto';
import { PaginationDto } from '../user/dto/pagination.dto';
import { ChangedMemberInfoDto } from './dto/changed.member.info.dto';
import { MemberSearchDto } from './dto/member.search.dto';

@Injectable()
export class MemberService {
  constructor(
    private readonly adminPvd : AdminProvider
  ){}

  public async members(
    page : PaginationDto,
    date : DateRangeDto,
    search : MemberSearchDto
  ) : Promise<ServiceData> {
    try {
      let startDate = null;
      let endDate = null;
      if(date.end_date && date.start_date) {
        startDate = parseDashDate(date.start_date);
        endDate = `${parseDashDate(date.end_date)} 23:59:59`;
      }
      const count = this.adminPvd.count(startDate , endDate , search);
      const members = this.adminPvd.admins(page , startDate , endDate , search);
      if(members) {
        return ServiceData.ok(
          'Successfully getting admin users',
          {
            count : await count,
            members : await members
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async changedInfo(
    values : ChangedMemberInfoDto
  ) {
    try {
      let obj : QueryPartialEntity<AdminUser> = {};
      if(values.email) {
        obj.email = values.email
      }
      if(values.mobile) {
        obj.mobile = values.mobile
      }
      if(values.authority === 0 || values.authority === 1) {
        obj.type = values.authority
      }
      if(values.status === 0 || values.status === 1 || values.status === 2) {
        obj.status = values.status
        if(values.status === 1) {
          obj.stoped_at = new Date()
        }
        if(values.status === 2) {
          obj.terminated_at = new Date()
        }
      }
      if(values.name) {
        obj.name = values.name
      }
      const admin = await this.adminPvd.updateUser(values.user_id , obj);
      if(admin.affected === 1) {
        return ServiceData.ok(
          'Successfully update admin user',
          {result : true},
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async member(id : number) : Promise<ServiceData> {
    try {
      const member = await this.adminPvd.findByNumId(id , [
        `${SchemaNames.admin_users}.id`,
        `${SchemaNames.admin_users}.user_num`,
        `${SchemaNames.admin_users}.user_id`,
        `${SchemaNames.admin_users}.name`,
        `${SchemaNames.admin_users}.mobile`,
        `${SchemaNames.admin_users}.email`,
        `${SchemaNames.admin_users}.type`,
        `${SchemaNames.admin_users}.status`,
        `${SchemaNames.admin_users}.login_at`,
        `${SchemaNames.admin_users}.created_at`,
        `${SchemaNames.admin_users}.stoped_at`,
        `${SchemaNames.admin_users}.terminated_at`,
      ])
      if(member) {
        return ServiceData.ok(
          'Successfully getting admin user',
          {member : member},
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
