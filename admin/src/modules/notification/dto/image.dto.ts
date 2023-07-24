import { ApiBodyOptions, ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ImageDto {
  @ApiProperty({
    type : String
  })
  @IsString()
  image : string;
}

export const ImageSchema : ApiBodyOptions = {
  schema : {
    type : 'object',
    properties : {
      image : {
        type : 'string',
        format : 'binary'
      }
    }
  }
}