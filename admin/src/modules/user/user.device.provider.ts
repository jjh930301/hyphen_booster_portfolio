import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchemaNames } from "src/constants/schema.names";
import { UserDevice } from "src/entities/booster/user/user.device.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserDeviceProvider {
  constructor(
    @InjectRepository(UserDevice)
    private readonly deviceRepo : Repository<UserDevice>
  ){}

  public async findDevices() : Promise<UserDevice[]> {
    return await this.deviceRepo.createQueryBuilder(SchemaNames.user_devices)
      .select([
        `${SchemaNames.user_devices}.token AS token`
      ])
      .getRawMany();
  }

  public async findDevicesByUser(id : string) : Promise<UserDevice[]> {
    try {
      return await this.deviceRepo.createQueryBuilder(SchemaNames.user_devices)
        .select([
          `${SchemaNames.user_devices}.token AS token`
        ])
        .where(`${SchemaNames.user_devices}.user = :user` , {
          user : id
        })
        .getRawMany();
    } catch(e) {
      return null;
    }
  }
}