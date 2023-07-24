import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Alert } from "src/entities/booster/user/alert.entity";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { Repository } from "typeorm";
import { CreateAlertVO } from "./vo/create.alert.vo";

@Injectable()
export class AlertProvider {
  static models = [
    Alert
  ]
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepo : Repository<Alert>
  ){}

  public async createAlert(
    business : UserBusiness,
    data : CreateAlertVO
  ) : Promise<Alert> {
    try {
      return await this.alertRepo.create({
        business : business,
        title : data.title,
        body : data.body,
        event : data.event ? data.event : null,
        event_type : data.event_type ? data.event_type : null,
        is_read : false,
        is_public : data.is_public
      }).save();
    } catch(e) {
      return null;
    }
  }
}