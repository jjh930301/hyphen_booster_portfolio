import { ApiProperty } from "@nestjs/swagger";

export class ServiceTypeDto {
  @ApiProperty({
    type : Number,
    description : `
      0 : 배민
      1 : 요기요
      2 : 쿠팡이츠
    `
  })
  service : number;
}