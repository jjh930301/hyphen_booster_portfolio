import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class RegistAdminDto {
  @ApiProperty({
    type : String,
    description : 'user_id'
  })
  @IsString()
  user_id : string;

  @ApiProperty({
    type : String,
    description : 'password'
  })
  @IsString()
  password : string;

  @ApiProperty({
    type : String,
    description : 'name'
  })
  @IsString()
  name : string;

  @ApiProperty({
    type : String,
    description : 'mobile'
  })
  @IsString()
  mobile : string;

  @ApiProperty({
    type : String,
    description : 'email'
  })
  @IsString()
  email : string;

  @ApiProperty({
    type : Number,
    description : `
      0 : 최고 관리자
      1 : 관리자
    `,
  })
  @IsNumber()
  type : number;
}