import { ApiProperty } from "@nestjs/swagger";

export class UserTypesDto {
  @ApiProperty({
    type : Number,
    required : false,
    description : `
      0 : 사용
      1 : 휴면
      2 : 중지
      3 : 탈퇴
    `
  })
  type : number;

  @ApiProperty({
    type : Number,
    required : false,
    description : `
      0 : 남자 
      1 : 여자
    `
  })
  gender : number;

  @ApiProperty({
    type : Number,
    required : false,
    description : `
      1 : 비즈니스가 등록된 유저 
      2 : 비즈니스가 등록되지 않은 유저
    `
  })
  business : number;

  @ApiProperty({
    type : Number,
    required : false,
    description : `
      1 : 연결기관 연결된 유저 
      2 : 연결기관이 연결되지 않은 유저
    `
  })
  connected : number;

  @ApiProperty({
    type : Number,
    required : false,
    description : `
      0 : 아무것도 신청하지 않은 유저
      1 : 선정산 유저
      2 : 선정산 신청중인 유저
      3 : 선정산 반려된 유저
      4 : 선정산 해지된 유저
    `
  })
  is_paid : number;
}