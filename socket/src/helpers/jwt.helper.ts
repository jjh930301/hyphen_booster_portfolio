import { JwtService } from "@nestjs/jwt";
import { Constants } from "src/constants/constants";

export class JwtHelper {

  static jwtService = new JwtService({
    secret: Constants.secret,
    signOptions: { 
      expiresIn: 3600 * 24, 
      issuer: 'hyphen-booster' , 
      algorithm : "HS256" 
    },
  });

  static verify = (accessToken: string): any => {
    try {
      const bearer = accessToken.split("Bearer ")
      const data = this.jwtService.verify(
        bearer.length === 2 ? bearer[1] : bearer[0], 
        {
          secret: Constants.secret,
        }
      );

      return {
        id: data.id,
        unique: data.unique,
        token_type : data.token_type,
        status_code: 200,
      };
    } catch (e) {
      const errorName = e.name;
      const isExpired = errorName === 'TokenExpiredError';
      return {
        id: null,
        unique: null,
        token_type : null,
        status_code: 401,
      };
    }
  };
}