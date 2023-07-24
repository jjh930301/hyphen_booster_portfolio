import { ApiProperty } from "@nestjs/swagger";

class Admin {
  @ApiProperty({
    default : 6,
    type : Number,
    description : `id`
  })
  id : number;

  @ApiProperty({
    default : "MA-6",
    type : String,
    description : `user_num`
  })
  user_num : string;

  @ApiProperty({
    default : "지정의",
    type : String,
    description : `name`
  })
  name : string;

  @ApiProperty({
    default : "justin",
    type : String,
    description : `user id`
  })
  user_id : string;

  @ApiProperty({
    default : "010-1234-5678",
    type : String,
    description : `mobile`
  })
  mobile : string;

  @ApiProperty({
    default : "user@gmail.com",
    type : String,
    description : `email`
  })
  email : string;

  @ApiProperty({
    default : 0,
    type : String,
    description : `
      0 최고 관리자
      1 일반 관리자
    `
  })
  type : string;

  @ApiProperty({
    default : 0,
    type : String,
    description : `
      계정 상태
      0 사용
      1 중지
      2 해지
    `
  })
  status : string;

  @ApiProperty({
    default : "2022-10-26T17:47:47.433Z",
    type : String,
    description : `생성일`
  })
  created_at : string;

  @ApiProperty({
    default : "2022-11-24T00:31:53.350Z",
    type : String,
    description : `최종 로그인 시간 UTC`
  })
  login_at : string;

}

export class AdminResponse {
  @ApiProperty({
    type : Admin
  })
  admin : Admin;

  @ApiProperty({
    type : String,
    default : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Imp1c3RpbiIsInVuaXF1ZSI6Impvb0B0aGlydHlkYXlzbGFiLmNvbSIsInRva2VuX3R5cGUiOjAsImlhdCI6MTY2OTI0OTkxMywiZXhwIjoxNjY5MzM2MzEzLCJpc3MiOiJoeXBoZW4tYm9vc3Rlci1hZG1pbiJ9.hth7YPkEqi150yllm2flKGHTTkSKBNb03h2dQ65xqdU"
  })
  access_token : string;

  @ApiProperty({
    type :  String,
    default :"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6Imp1c3RpbiIsInVuaXF1ZSI6Impvb0B0aGlydHlkYXlzbGFiLmNvbSIsInRva2VuX3R5cGUiOjAsImlhdCI6MTY2OTI0OTkxMywiZXhwIjoxNjcxODQxOTEzLCJpc3MiOiJoeXBoZW4tYm9vc3Rlci1hZG1pbiJ9.nDyWbPFNNvLUnhnoDkGYyf98GLcAp_kcydwKrjzjzk94-N1mHbiDmYInskTjf1uP8dTn3eyFIrfyJTE-IF5pdw"
  })
  refresh_token : string;
}