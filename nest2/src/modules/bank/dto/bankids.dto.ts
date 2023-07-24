import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class BankIdsDto {
  @ApiProperty({
    type : String,
    example : `['06a6e38a-7c10-4448-ab6a-4a8f78203f02' , 'da2eb439-7244-471d-abc3-0c5826de3b9d' , '3e85d201-c089-4af5-ad04-de812e4db65d' , '2d0a07cc-0602-458b-b46b-3cdec9d5ce8a' ,'bd48efdd-357b-4d6b-a142-6d59204559c6','36ad79ec-1f68-40cc-91d3-1a8bc8a6284a','93946edd-8c5a-40c8-99cf-70aa62a78eba','eab31ad7-9d22-4b5a-bf3e-cc70ea1fee8c']`,
    required : true
  })
  @IsNotEmpty()
  bank_ids : string;
}