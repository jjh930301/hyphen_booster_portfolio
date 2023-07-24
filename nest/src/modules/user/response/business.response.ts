import { ApiProperty } from "@nestjs/swagger";

export class BusinessResponse {
  @ApiProperty({
    type : String,
    default :  "3808501805",
    description : `사업자 번호`
  })
  business_number : string;

  @ApiProperty({
    type : String,
    default :  "파앤슈어주식회사벨라시타일산점",
    description : `사업장명`
  })
  store_name : string;

  @ApiProperty({
    type : String,
    default :  null,
    description : `업종`
  })
  sector : string;

  @ApiProperty({
    type : String,
    default :  null,
    description : `업태`
  })
  status : string;

  @ApiProperty({
    type : String,
    default :  1,
    description : `
      과세 유형
      01 부가가치세 일반과세자  
      02 부가가치세 간이과세자  
      03 부가가치세 면세과세자  
      06 비영리법인   
      07 부가가치세 과특사업자
    `
  })
  tax_type : string;

  @ApiProperty({
    type : String,
    default :  '1997-07-19',
    description : `개업일`
  })
  opened_at : string;

}