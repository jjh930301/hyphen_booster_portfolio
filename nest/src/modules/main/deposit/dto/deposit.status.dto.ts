import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class DepositStatusDto {
  @ApiProperty({
    type : String,
    description : '입금일'
  })
  @IsString()
  payment_date : string;

  @ApiProperty({
    type : Number,
    description : `
      카드코드
      KB카드 : 1
      비씨카드 : 2
      현대카드 : 3
      하나카드 : 4
      삼성카드 : 5
      신한카드 : 6
      롯데카드 : 7
      농협NH카드 : 8
      우리카드 : 9
      씨티은행 : 10
    `
  })
  @IsNumber()
  card_code : number;
}