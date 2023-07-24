import { ApiBodyOptions, ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class ModifyInquiryDto {

  @ApiProperty({
    type : String,
    description : 'uuid'
  })
  id : string;

  @ApiProperty({
    type : Number,
    nullable : false,
    description : `0 : 사업자등록번호 추가 / 1 : 의견 보내기 / 2 : 서비스 오류 문의 / 3 : 이벤트 문의 / 4 : 기타`
  })
  @IsNumber()
  type : number;

  @ApiProperty({
    type : String,
    nullable : false,
    description : '제목'
  })
  @IsString()
  title : string;

  @ApiProperty({
    type : String,
    nullable : true,
    description : '삭제된 이미지들',
  })
  delete_images : string;
  
  @ApiProperty({
    type : String,
    nullable : false,
    description : '내용'
  })
  @IsString()
  description : string;
}

export const ModifyInquirySchema : ApiBodyOptions = {
  schema : {
    type : 'object',
    properties : {
      id : {
        type : 'string',
        description : 'uuid'
      },
      type : {
        type : 'number',
        description : `0 : 사업자등록번호 추가 / 1 : 의견 보내기 / 2 : 서비스 오류 문의 / 3 : 이벤트 문의 / 4 : 기타`,
        nullable : false,
        default : 2
      },
      title : {
        type : 'string',
        description : '제목',
        nullable :false,
      },
      description : {
        type : 'string',
        description : '내용',
        nullable :false,
      },
      delete_images : {
        type : 'string',
        description : '삭제할 이미지들',
        nullable : true,
        default : '["url" , "url"]'
      },
      images : {
        type : 'array',
        items : {
          type : 'string',
          format : 'binary'
        },
        description : 'image files'
      }
    }   
  }
}