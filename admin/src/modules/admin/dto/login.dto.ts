import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({
    type : String,
    description : 'id'
  })
  @IsString()
  id : string;

  @ApiProperty({
    type : String,
    description : 'password'
  })
  @IsString()
  password : string;

  @ApiProperty({
    type : Number,
    description : `
      0 : 로그인 상태유지 미체크
      1 : 로그인 상태유지 체크
    `,
    required : false
  })
  is_check : number
}