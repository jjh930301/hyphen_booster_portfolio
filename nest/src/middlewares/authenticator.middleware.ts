import { Injectable, NestMiddleware } from '@nestjs/common';

import { ServiceData } from 'src/models';

import { JwtHelper } from 'src/helpers/jwt.helper';
import { TokenType } from 'src/enums/token.type';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/booster/user/user.entity';
import { Repository } from 'typeorm';
import { SelectHelper } from 'src/helpers/select/select.helper';
import { UserProvider } from 'src/modules/user/user.provider';


@Injectable()
export class Authenticator implements NestMiddleware {

  constructor(
    private readonly userPvd : UserProvider
  ) { }

  async use(req: any, res: any, next: () => void): Promise<any> {
    try {
      // const tokenType = req.route.path === '/api/user/' ? TokenType.user : TokenType.partner;
      const token = req.headers.authorization;
      
      if (token === (null || undefined)) {
        res.status(404).send({
          message: ["Cannot Access[Token is not exists]"],
          payload: {result : null},
          result_code : 4004,
        });
      }
      const verification = JwtHelper.verify(token);

      const schemaModel = await this.userPvd.joinById(
        verification.id,
        [
          ...SelectHelper.user_select,
          'devices.password',
          'devices.fail_count'
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
        req.user = schemaModel;
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
      throw (e);
    }
  }
}
