import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { UserCert } from "src/entities/booster/user/user.cert.entity";
import { Repository } from "typeorm";

@Injectable()
export class CertProvider {
  constructor(
    @InjectRepository(UserCert)
    private readonly certRepo : Repository<UserCert>
  ){}

  public async findExpiredCert(now : string) : Promise<Array<UserCert>> {
    try {
      return await this.certRepo.createQueryBuilder(SchemaNames.user_certs)
        .select([
          `${SchemaNames.user_certs}.cert_number as cert_number`,
          `${SchemaNames.user_certs}.cert_expiration as cert_expiration`,
          `${SchemaNames.user_certs}.user as user`,
          `${SchemaNames.user_certs}.business as business`,
        ])
        .where(`${SchemaNames.user_certs}.cert_expiration <= '${now}'`)
        .getRawMany()
    } catch(e) {
      console.log(e);
      return null;
    }
  }

  public async removeCert(certNum : string) : Promise<void> {
    await this.certRepo.createQueryBuilder()
      .delete()
      .from(UserCert)
      .where(`cert_number = :certNum` , {certNum : certNum})
      .execute()
  }
}