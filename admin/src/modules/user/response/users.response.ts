import {ApiProperty} from '@nestjs/swagger';

export class BusinessModel {
  @ApiProperty({
    type : String,
    default : 'f37efeb6-63dc-43b0-b786-c5654622784e'
  })
  id : string;

  @ApiProperty({
    type : String,
    default : "gudqhdwls1"
  })
  crefia_id : string;
  
  @ApiProperty({
    type : String,
    default : "gudqhdwls"
  })
  hometax_id : string;
  
  @ApiProperty({
    type : String,
    default : null
  })
  baemin_id : string;
  
  @ApiProperty({
    type : String,
    default : null
  })
  yogiyo_id : string;
  
  @ApiProperty({
    type : String,
    default : null
  })
  coupange_id : string;
  
}
export class UserModel {
  @ApiProperty({
    type : String,
    default : "MU-038g7R"
  })
  user_num : string;

  @ApiProperty({
    type : String,
    default : "김진석"
  })
  name : string;

  @ApiProperty({
    type : String,
    default : "01012345678"
  })
  mobile : string;

  @ApiProperty({
    type : String,
    default : "1986-10-03"
  })
  date_of_birth : string;

  @ApiProperty({
    type : Number,
    default : 0,
    description : `
      0 : 남자
      1 : 여자
    `
  })
  gender : number;

  @ApiProperty({
    type : Number,
    description : `
      0 : 사용
      1 : 휴면
      2 : 중지
      3 : 탈퇴
    `
  })
  type : number;

  @ApiProperty({
    type : String,
    default : "2022-10-27T18:05:10.284Z"
  })
  created_at : string;

  @ApiProperty({
    type : String,
    default : "2022-10-31"
  })
  refreshed_at : string;

  @ApiProperty({
    type : String,
    default : '2022-10-28T13:46:10.302Z'
  })
  deleted_at : string;

  @ApiProperty({
    type : [BusinessModel],
  })
  businesses : [BusinessModel];
}
export class UsersResponse {
  @ApiProperty({
    type : Number,
    default : 16
  })
  count : number;

  @ApiProperty({
    type : [UserModel]
  })
  users : UserModel

}