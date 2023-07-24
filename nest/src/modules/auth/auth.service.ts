import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Constants } from 'src/constants/constants';
import { User } from 'src/entities/booster/user/user.entity';
import { TokenType } from 'src/enums/token.type';
import { ServiceData } from 'src/models';
import { UserProvider } from '../user/user.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly userPvd : UserProvider,
    private readonly jwtSvc : JwtService
  ){}

  public async getToken(
    id: string, 
    unique: string, 
    token_type: number
  ) : Promise<ServiceData> {
    try {
      const user = await this.userPvd.findById(id);
      if(!user)
        return ServiceData.cannotAccess(' user not found')
      const access_token = await this.createToken(id , unique , token_type);
      return ServiceData.ok(
        "Successfully create new token" , 
        {
          access_token
        },
        2101
      )
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async createURL() : Promise<ServiceData> {
    const user = await this.userPvd.findAll();
    // 임시 토큰
    const token = await this.createToken(user[0].id , user[0].name , TokenType.user);
    return ServiceData.ok(
      "Successfully creating test url",
      {
        url : `http://localhost?key=${token}`
      },
      2101
    )
  }

  private async createToken(
    id: string, 
    unique: string, 
    token_type: number,
    expried_in : number | null = 3600 * 24 // one day
  ): Promise<string | null> {
    const secret = process.env.JWT_SECRET
    return await this.jwtSvc.signAsync({
      id,
      unique,
      token_type
    }, {
      expiresIn: expried_in,
      secret: secret,
    });
  }
}
