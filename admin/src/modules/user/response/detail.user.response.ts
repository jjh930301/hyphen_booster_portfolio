import { ApiProperty } from "@nestjs/swagger";

class Devices {
  @ApiProperty({
    type : String,
    default :  "b152a72e-92a0-4a97-963a-8688966e1744",
    description : ``
  })
  id : string;

  @ApiProperty({
    type : String,
    default :  "ifon-justin",
    description : ``
  })
  device_name : string;

  @ApiProperty({
    type : Number,
    default :  0,
    description : ``
  })
  operating_system : number;

}

class Bank {
  @ApiProperty({
    type : String,
    default : "bc222f69-a56b-4ea1-8cdc-1e295507870f",
    description : "uuid",
  })
  id : string;

  @ApiProperty({
    type : String,
    default : "21718250746",
    description : "계좌번호",
  })
  account : string;

  @ApiProperty({
    type : String,
    default : "No25 FRT카드매출",
    description : "카드명",
  })
  account_name : string;

  @ApiProperty({
    type : String,
    default : 1,
    description : `
      1 : 개인
      2 : 기업
    `,
  })
  type : string;

  @ApiProperty({
    type : String,
    default : "081",
    description : "",
  })
  bank_type : string;

  @ApiProperty({
    type : Number,
    default : 0,
    description : `
    0 : none
    1 : 선정산
    `,
  })
  is_paid : number;

  @ApiProperty({
    type : Number,
    default : 0,
    description : "선정산 오픈 상태",
  })
  paid_open : number;

  @ApiProperty({
    type : String,
    default : "2023-06-14",
    description : "선정산 시작일",
  })
  paid_opened_at : string;

  @ApiProperty({
    type : String,
    default : null,
    description : "영업사원 전화번호",
  })
  sales_person_mobile : string;

  @ApiProperty({
    type : String,
    default : null,
    description : "계약일",
  })
  contracted_at : string;

  @ApiProperty({
    type : String,
    default : null,
    description : "계약종료일",
  })
  contract_ended_at : string;

  @ApiProperty({
    type : String,
    default : null,
    description : "출금시작일",
  })
  paid_started_at : string;

  @ApiProperty({
    type : String,
    default : null,
    description : "출금종료일",
  })
  paid_ended_at : string;

  @ApiProperty({
    type : String,
    default : 0,
    description : `
    0 : none 
    1 : 승인 
    2 : 해지 
    3 : 반려
    `,
  })
  status : string;

  @ApiProperty({
    type : String,
    default : null,
    description : "계정 | 인증서 연결일",
  })
  connected_at : string;

  @ApiProperty({
    type : String,
    default : "2023-06-14T14:20:08.520Z",
    description : "",
  })
  created_at : string;

  @ApiProperty({
    type : String,
    default : "cert",
    description : `
    계정 | 인증서 연결 타입
    cert : 인증서
    id : 계정
    `,
  })
  login_type : string;

}

class Businesses {
  @ApiProperty({
    type : String,
    default :  "288d8c13-1916-40e3-9e5e-56a165144eba",
    description : ``
  })
  id : string;

  @ApiProperty({
    type : String,
    default :  "1130152567",
    description : ``
  })
  business_number : string;

  @ApiProperty({
    type : String,
    default :  "30lab",
    description : ``
  })
  store_name : string;

  @ApiProperty({
    type : String,
    default :  "jinhgoon",
    description : ``
  })
  crefia_id : string;

  @ApiProperty({
    type : String,
    default :  "jinhgoo",
    description : ``
  })
  hometax_id : string;

  @ApiProperty({
    type : String,
    default :  "megazero",
    description : ``
  })
  baemin_id : string;

  @ApiProperty({
    type : String,
    default :  null,
    description : `string`
  })
  yogiyo_id : string;

  @ApiProperty({
    type : String,
    default :  null,
    description : `string`
  })
  coupange_id : string;

  @ApiProperty({
    type : Number,
    default : 1,
    description : '0 : ksnet 이용자가 아님 1 : ksnet 밴'
  })
  is_ksnet : number;

  @ApiProperty({
    type : String,
    default : '2022-11-03 05:21:57',
    description : '동의일시'
  })
  agreemented_at : String;

  @ApiProperty({
    type : String,
    default :  null,
    description : `1997-08-01 Date`
  })
  opened_at : string;

  @ApiProperty({
    type : String,
    default :  "2022-10-27T18:19:01.069Z",
    description : `추가일`
  })
  created_at : string;
  @ApiProperty({
    type : [Bank]
  })
  banks : [Bank]

}

export class DetailUserResponse {
  @ApiProperty({
    type : String,
    default : "7a22ec29-fe2a-483d-91b1-1ce17db7dbfb",
    description : ''
  })
  id : string;

  @ApiProperty({
    type : String,
    default : "MU-038g7R",
    description : ''
  })
  user_num : string;

  @ApiProperty({
    type : String,
    default : "김진석",
    description : ''
  })
  name : string;

  @ApiProperty({
    type : String,
    default : "01012345678",
    description : ''
  })
  mobile : string;

  @ApiProperty({
    type : String,
    default : "1986-10-03",
    description : ''
  })
  date_of_birth : string;

  @ApiProperty({
    type : Number,
    default : 0,
    description : '0 남자 1 여자'
  })
  gender : number;

  @ApiProperty({
    type : Number,
    default : 0,
    description : '0 : 사용 , 1 : 휴면 , 2: 정지 , 3 : 탈퇴'
  })
  type : number;

  @ApiProperty({
    type : String,
    default : "2022-10-27T18:05:10.284Z",
    description : '가입일'
  })
  created_at : string;

  @ApiProperty({
    type : String,
    default : "2022-11-01",
    description : '최근 접속일'
  })
  refreshed_at : string;

  @ApiProperty({
    type : [Businesses]
  })
  businesses : [Businesses]

  @ApiProperty({
    type : [Devices]
  })
  devices : [Devices]
}