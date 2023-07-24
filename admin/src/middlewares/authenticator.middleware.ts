import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';

import { ServiceData } from 'src/models';

import { JwtHelper } from 'src/helpers/jwt.helper';
import { TokenType } from 'src/enums/token.type';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/booster/user/user.entity';
import { Repository } from 'typeorm';
import { SelectHelper } from 'src/helpers/select/select.helper';
import { AdminProvider } from 'src/modules/admin/admin.provider';
import { SchemaNames } from 'src/constants/schema.names';


@Injectable()
export class Authenticator implements NestMiddleware {

  constructor(
    private readonly adminPvd : AdminProvider
  ) { }

  async use(req: any, res: any, next: () => void): Promise<any> {
    try {
      const token = req.headers.authorization;
      
      if (token === (null || undefined)) {
        res.status(404).send({
          message: ["Cannot Access[Token is not exists]"],
          payload: {result : null},
          result_code : 4004,
        });
      }

      const jwt = new JwtHelper();
      const verification = jwt.verify(token);

      const schemaModel = await this.adminPvd.findById(
        verification.id,
        [
          `${SchemaNames.admin_users}.id`,
          `${SchemaNames.admin_users}.user_num`,
          `${SchemaNames.admin_users}.password`,
          `${SchemaNames.admin_users}.name`,
          `${SchemaNames.admin_users}.user_id`,
          `${SchemaNames.admin_users}.email`,
          `${SchemaNames.admin_users}.type`,
          `${SchemaNames.admin_users}.created_at`,
        ]
      );
    
      //Token is expired
      if (verification.status_code === 401) {
        return res.status(401).send({
          message: [`authentication is expired[Required create new token]`],
          payload: {result : null},
          result_code: 4019
        })
      }
      
      if (schemaModel === null) {
        return res.status(404).send({
          message: ["Cannot Access[User not found]"],
          payload: {result : null},
          result_code : 4004,
        });
      }
      if (verification.status_code == 200) {
        req.admin = schemaModel;
        next();
        return;
      } else {
        return res.status(404).send({
          message: ["Cannot Access[Unknown]"],
          payload: {result : null},
          result_code : 5000,
        })
      }
    } catch (e) {
      throw new BadRequestException({
        message : [e.message],
        payload : {
          result : null
        },
        status_code : 4001
      });
    }
  }
}
