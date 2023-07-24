import { JwtService } from "@nestjs/jwt";
import { Constants } from "src/constants/constants";

export class JwtHelper {

  private jwtAccessToken = new JwtService({
    secret: Constants.admin_secret,
    signOptions: { 
      expiresIn: 3600 * 24, 
      issuer: 'hyphen-booster-admin' , 
      algorithm : "HS256" 
    },
  });
  private jwtRefreshToken = (
    expired_time : number
  ) => new JwtService({
    secret : Constants.admin_refresh_secret,
    signOptions: {
      expiresIn: expired_time,
      issuer: 'hyphen-booster-admin' , 
      algorithm : "HS512" ,
    }
  })

  public createAccessToken = (
    id: string, // user_id
    unique: string , // 이메일
    token_type : number // 관리자 타입
  ): string => {
    const payload = {
      id: id,
      unique: unique,
      token_type : token_type
    };
    const accessToken = this.jwtAccessToken.sign(payload);
    return accessToken;
  };

  public createRefreshToken = (
    id : string,
    unique: string,
    token_type : number,
    expired_time : number | null = 3600 * 24
  ) : string => {
    const payload = {
      id: id,
      unique: unique,
      token_type : token_type
    };
    const refreshToken = this.jwtRefreshToken(expired_time).sign(payload);
    return refreshToken;
  }

  public verify = (accessToken: string): any => {
    try {
      const bearer = accessToken.split("Bearer ")
      const data = this.jwtAccessToken.verify(
        bearer.length === 2 ? bearer[1] : bearer[0], 
        {
          secret: Constants.admin_secret,
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

  public verfiyRefreshToken = (refreshToken : string) => {
    try {
      const bearer = refreshToken.split("Bearer ");
      const data = this.jwtRefreshToken(3600 * 24).verify(
        bearer.length === 2 ? bearer[1] : bearer[0], 
        {
          secret: Constants.admin_refresh_secret,
        }
      )

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
  }
}