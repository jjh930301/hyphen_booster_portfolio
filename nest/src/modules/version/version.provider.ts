import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { Version } from "src/entities/booster/version.entity";
import { Repository } from "typeorm";

export class VersionProvider {
  static models = [
    Version
  ]

  constructor(
    @InjectRepository(Version)
    private readonly versionRepo : Repository<Version>
  ){}

  public async version() {
    try {
      return await this.versionRepo.createQueryBuilder(SchemaNames.version)
        .select([`${SchemaNames.version}.version`])
        .where('version is not null')
        .orderBy('created_at' , 'ASC')
        .getOne()
    } catch(e) {
      console.log(e)
      return null;
    }
  }
}