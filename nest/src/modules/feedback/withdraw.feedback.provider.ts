import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/booster/user/user.entity";
import { WithdrawFeedBack } from "src/entities/booster/withdraw.feedback.entity";
import { Repository } from "typeorm";
import { WithdrawDto } from "../user/dto/withdraw.dto";

@Injectable()
export class WithdrawFeedbackProvider {
  static models = [
    WithdrawFeedBack
  ]

  constructor(
    @InjectRepository(WithdrawFeedBack)
    private readonly withdrawRepo : Repository<WithdrawFeedBack>
  ){}

  public async createFeedback(
    user : User,
    body : WithdrawDto
  ) {
    try {
      await this.withdrawRepo.create({
        type : body.type,
        description : body.description,
        user_gender : user.gender,
        user_id : user.id,
        user_mobile : user.mobile,
        user_name : user.name,
      }).save();
    } catch(e) {
      console.log(e);
    }
  }
}