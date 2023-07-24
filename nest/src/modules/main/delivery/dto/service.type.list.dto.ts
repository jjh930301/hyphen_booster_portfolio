import { ApiProperty } from "@nestjs/swagger";

export class ServiceTypeListDto {
  @ApiProperty({
    default : '[0,1]',
    required : false,
    description : `
      0 : 배민
      1 : 요기요
      2 : 쿠팡이츠
    `
  })
  services : string;
}