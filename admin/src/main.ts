import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupSwagger } from './setup.swagger';
import { Exceptions } from './utils/exceptions';
import admin from 'firebase-admin';
import account from 'src/service-account.json';
import expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    ['/docs'],
    expressBasicAuth({
      challenge: true,
      users: { 'root': 'password' },
    }),
  )
  app.useGlobalFilters(new Exceptions());
  app.useGlobalPipes(new ValidationPipe({
    transform : true,
    transformOptions : {
      enableImplicitConversion : true
    }
  }));
  app.enableCors({
    origin: true,
    credentials: true,
  });

  setupSwagger(app);

  admin.initializeApp({
    credential : admin.credential.cert(account as Object)
  })

  app.enableVersioning({ type: VersioningType.URI });
  
  await app.listen(5555);
}
bootstrap();
