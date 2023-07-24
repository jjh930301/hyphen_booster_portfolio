import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Token } from "src/entities/booster/token.entity";
import { Repository } from "typeorm";

@Injectable()
export class TokenProvider {
  static models = [
    Token
  ]
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepo : Repository<Token>
  ) {}

  public async upsertToken(token) {
    try {
      const upsert = await this.tokenRepo.createQueryBuilder()
        .insert()
        .into(Token)
        .values({
          type : 0,
          token : token
        })
        .orUpdate({
          conflict_target : [
            'type'
          ],
          overwrite : [
            'token'
          ]
        })
        .execute()
      return upsert
    } catch(e) {
      return null;
    }
  }

  public async getToken() : Promise<string> {
    const token = await this.tokenRepo.findOne({
      where : {
        type : 0
      }
    })
    return token.token;
  }
}