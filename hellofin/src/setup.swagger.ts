import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const setupSwagger = (app : INestApplication) : void => {
  const options = new DocumentBuilder()
  .setTitle("hello fin tech doc")
  .setDescription(`
    1.Bearer Token이 반드시 필요합니다.
    2.api 상단 description에 result_code에 대한 값이 정리되어 있습니다.
    3.response model은 success일 때만 정의되어 있습니다.
    4.response model의 Example Value | Schema는 key값에 대해 설명이 정의되어 있습니다.
  `)
  .addBearerAuth({
    name : 'authentication',
    type : 'http',
    in : 'Header'
  } , 'bearer token')
  .setVersion("1.0.0")
  .build()

  const document = SwaggerModule.createDocument(app , options);
  SwaggerModule.setup('docs' , app , document);
}