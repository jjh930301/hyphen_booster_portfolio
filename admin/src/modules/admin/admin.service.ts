import { Injectable } from '@nestjs/common';
import { SchemaNames } from 'src/constants/schema.names';
import { AdminUser } from 'src/entities/admin/admin.user.entity';
import { JwtHelper } from 'src/helpers/jwt.helper';
import { ServiceData } from 'src/models';
import { compare } from 'src/utils/crypto';
import { DataSource } from 'typeorm';
import { AdminProvider } from './admin.provider';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AdminService {
  private jwt : JwtHelper

  constructor(
    private readonly adminPvd : AdminProvider,
    private readonly datasource : DataSource
  ){
    this.jwt = new JwtHelper();
  }

  public async login(
    adminDto : LoginDto
  ) : Promise<ServiceData> {
    try {
      const admin = await this.adminPvd.login(adminDto.id);
      
      if(!admin) return ServiceData.cannotAccess(` [not found admin]` , 4101);
      console.log(admin)
      if(5 <= admin.count) {
        return ServiceData.cannotAccess(
          ` [Required change password]`,
          4102
        );
      }
      if(await compare(adminDto.password , admin.password) === false) {
        
        return ServiceData.ok(
          `invalid password` ,
          {
            admin : admin.count + 1
          },
          2102
        );
      }
      const refreshToken = this.jwt.createRefreshToken(
        admin.user_id,
        admin.email,
        admin.type,
        adminDto.is_check === 0 ? 3600 * 24 * 7 : 3600 * 24 * 30
      )
      const accessToken = this.jwt.createAccessToken(
        admin.user_id,
        admin.email,
        admin.type,
      )

      admin.refresh_token = refreshToken;
      admin.login_at = new Date();
      admin.count = 0;
      await this.adminPvd.updateUser(admin.id , {
        refresh_token : refreshToken,
        login_at : new Date(),
        count : 0,
      })
      if(admin) {
        
        return ServiceData.ok(
          'Successfully getting admin user',
          {
            admin : {
              id : admin.id,
              user_num : admin.user_num,
              name : admin.name,
              user_id : admin.user_id,
              mobile : admin.mobile,
              email : admin.email,
              type : admin.type,
              status : admin.status,
              created_at : admin.created_at,
              login_at : admin.login_at
            },
            access_token : accessToken,
            refresh_token : refreshToken
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      console.log(e);
      return ServiceData.serverError();
    }
  }

  public async token(
    refreshToken : string
  ) : Promise<ServiceData> {
    const jwt : JwtHelper = new JwtHelper();
    try {
      const verification = jwt.verfiyRefreshToken(refreshToken);
      if(verification.id === null) {
        return ServiceData.cannotAccess(' [Required login]' , 2102)
      }
      const admin : AdminUser = await this.adminPvd.findById(verification.id , [
        `${SchemaNames.admin_users}.id`,
        `${SchemaNames.admin_users}.user_num`,
        `${SchemaNames.admin_users}.name`,
        `${SchemaNames.admin_users}.user_id`,
        `${SchemaNames.admin_users}.mobile`,
        `${SchemaNames.admin_users}.email`,
        `${SchemaNames.admin_users}.type`,
        `${SchemaNames.admin_users}.status`,
        `${SchemaNames.admin_users}.created_at`,
        `${SchemaNames.admin_users}.login_at`,
      ]);
      
      if(admin) {
        const accessToken = this.jwt.createAccessToken(
          admin.user_id,
          admin.email,
          admin.type,
        )
        return ServiceData.ok(
          'Successfully getting accessToken & admin info',
          {
            admin : admin,
            access_token : accessToken,
            refresh_token : refreshToken
          }
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
