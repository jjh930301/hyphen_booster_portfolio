import { Injectable, NestMiddleware } from '@nestjs/common';
import { Constants } from 'src/constants/constants';
import { JwtHelper } from 'src/helpers/jwt.helper';
import { SelectHelper } from 'src/helpers/select/select.helper';


@Injectable()
export class Authenticator implements NestMiddleware {

  constructor() { }

  async use(req: any, res: any, next: () => void): Promise<any> {
    try {
      // const tokenType = req.route.path === '/api/user/' ? TokenType.user : TokenType.partner;
      const token = req.headers.authorization;
      
      if (token === (null || undefined)) {
        res.status(403).send({
          message: ["cannot Access[Token is not exists]"],
          payload: {result : null},
          result_code : 4003,
        });
      }
      const bearer = token.split("Bearer ")
      if (bearer[1] === Constants.HELLO_FINTECH_KEY) {
        next();
        return;
      } else {
        return res.status(401).send({
          message: [`required bearer key`],
          payload: {result : null},
          result_code: 4001
        })
      }
      // const verification = JwtHelper.verify(token);
    
      //Token is expired
      // if (verification.status_code === 401) {
      //   return res.status(401).send({
      //     message: [`authentication is expired[Required create new token]`],
      //     payload: {result : null},
      //     result_code: 4019
      //   })
      // }
      
      // if (verification.status_code == 200) {
      //   next();
      //   return;
      // } else {
      //   return res.status(404).send({
      //     message: ["Cannot Access[Unknown]"],
      //     payload: {result : null},
      //     result_code : 5000,
      //   })
      // }
    } catch (e) {
      throw (e);
    }
  }
}
