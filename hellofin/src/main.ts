import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setup.swagger';
import { Exceptions } from './utils/exceptions';
import admin from 'firebase-admin';
import account from 'src/service-account.json';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new Exceptions());
  app.useGlobalPipes(new ValidationPipe({
    transform : true,
    transformOptions : {
      enableImplicitConversion : true
    }
  }));

  if(process.env.ENV === "development") setupSwagger(app);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  admin.initializeApp({
    credential : admin.credential.cert(account as Object)
  })

  app.enableVersioning({ type: VersioningType.URI });

  await app.listen(8003);
}
bootstrap();
