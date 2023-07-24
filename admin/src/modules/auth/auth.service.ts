import { Injectable } from '@nestjs/common';
import { AdminUser } from 'src/entities/admin/admin.user.entity';
import { JwtHelper } from 'src/helpers/jwt.helper';
import { ServiceData } from 'src/models';
import { compare, hash } from 'src/utils/crypto';
import { DataSource } from 'typeorm';
import { AdminProvider } from '../admin/admin.provider';
import { ChangedPasswordDto } from './dto/changed.password.dto';
import { RegistAdminDto } from './dto/regist.admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminPvd : AdminProvider,
    private readonly datasource : DataSource
  ){}

  public async registAdmin(
    info : RegistAdminDto
  ) : Promise<ServiceData> {
    try {
      const jwt = new JwtHelper();
      const refreshToken = jwt.createRefreshToken(
        info.user_id , 
        info.email , 
        info.type
      )
      const admin = await this.adminPvd.registAdmin(info , refreshToken);
      if(!admin) {
        return ServiceData.serverCrudError();
      }
      await this.adminPvd.updateUser(admin.id , {
        user_num : `MA-${admin.id}`,
      })
      if(admin) {
        return ServiceData.ok(
          'Successfully regist new admin user',
          {
            result : true
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async defaultPassword(
    userId : string
  ) : Promise<ServiceData> {
    try {
      const admin = await this.adminPvd.updateUser(userId , {
        password : await hash('0000')
      })
      if(admin) {
        return ServiceData.ok(
          'Successfully changed default password',
          {
            result : true
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async changedPassword(
    admin : AdminUser,
    passwords : ChangedPasswordDto
  ) : Promise<ServiceData> {
    try {
      if(await compare(passwords.regacy_password,admin.password) === false) 
        return ServiceData.invalidRequest('Check your regacy password' , 4101)
      const model = await this.adminPvd.updateUser(admin.user_id , {
        password : await hash(passwords.new_password)
      })
      if(model) {
        return ServiceData.ok(
          'Successfully changed new password',
          {
            result : true
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
