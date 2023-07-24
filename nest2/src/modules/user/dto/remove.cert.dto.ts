import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";

export class UpdateOrRemoveCertDto {
  @ApiProperty({
    type : String,
    description : `사업자 uuid`,
    required : false
  })
  @IsOptional()
  business_id : string;

  @ApiProperty({
    type : String,
    description : `cert 번호`,
    required : true
  })
  @IsNotEmpty()
  cert_number : string;

  business : UserBusiness
}