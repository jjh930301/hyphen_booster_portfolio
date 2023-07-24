import { ApiProperty } from "@nestjs/swagger";

class Cert {
  @ApiProperty({
    default : 'd13764e9-a434-401e-8f05-909d16ad4119',
    description : '사업자 uuid'
  })
  id : string;
  @ApiProperty({
    default : "파앤슈어주식회사(벨라(fa)008102020220530181002354",
    description :'인증서 번호 '
  })
  cert_number: string;
  @ApiProperty({
    default : "yessign",
    description :'인증서 발급자'
  })
  cert_issuer: string;
  @ApiProperty({
    default : "2023-05-30",
    description :'인증서 만료일'
  })
  cert_expiration: string;
  @ApiProperty({
    type : String
  })
  oid : string

}

export default class CertList {
  @ApiProperty({
    type : String
  })
  cert : string;
  @ApiProperty({
    type : [Cert]
  })
  certs : [Cert]
}