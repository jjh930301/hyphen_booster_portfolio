import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const setupSwagger = (app : INestApplication) : void => {
  const options = new DocumentBuilder()
  .setTitle("hyphen-booster-admin doc")
  .setDescription(`
    hyphen-booster Admin server Documentation
  `)
  .addBearerAuth({
    name : "authorization",
    type : "http",
    in: "Header"
  } , "Required admin accessToken")
  .setVersion("1.0.0")
  .build()

  const document = SwaggerModule.createDocument(app , options);
  SwaggerModule.setup('docs' , app , document);
}