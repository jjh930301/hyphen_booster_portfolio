import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AccountDto {
  @ApiProperty({
    type : String,
    description : `
      쿠팡 ID
      0537820045
      요기요 ID
      clickisky
    `,
    required : true,
    default : 'clickisky',
  })
  @IsNotEmpty()
  id : string;

  @ApiProperty({
    type : String,
    description : `
      쿠팡 PW
      zl0537820045!!
      요기요 PW
      bae270130-
    `,
    required : true,
    default : 'bae270130-'
  })
  @IsNotEmpty()
  password : string;

  // @ApiProperty({
  //   type : String,
  //   description : `
  //     테스트로 등록하는 경우
  //     'Y' 입력하면 사업자번호가 등록되어 있지 않아도 등록됩니다.
  //   `,
  //   required : false,
  //   default : "Y"
  // })
  // test : string;
}