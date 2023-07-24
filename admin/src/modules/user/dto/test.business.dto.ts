import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class TestBusinessDto {
  @ApiProperty({
    type : String,
    description : `
    사업자 번호
    2011830000
    1130152567 여신금융
    요기요 앗싸곱창 1590100000
    쿠팡이츠 떡볶이 3397700000
    `,
    examples : ['2011830000','1130150000'],
    default : '1130150000'
  })
  @IsNotEmpty()
  @IsString()
  business_number : string;

  @ApiProperty({
    type : String,
    default : null,
    description : `
      사업장 이름
      화면에 TextField가 생겼을 때 값을 넣어주면 됩니다.
      빈 값일 경우 null로 넣어주세요
    `,
    required :false
  })
  store_name : string;

  @ApiProperty({
    type : String,
    default : '19970719',
    description : '개업일',
    required : false
  })
  opened_at : string;
}