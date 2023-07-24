import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './utils/sockerio.adapter';
import admin from 'firebase-admin';
import account from 'src/service-account.json';
import { Constants } from './constants/constants';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);

  const redisIoAdapter = new SocketIoAdapter(app);
  
  app.useWebSocketAdapter(redisIoAdapter);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // for firebase initialize
  admin.initializeApp({
    credential : admin.credential.cert(account as Object)
  })

  await app.startAllMicroservices();

  await app.listen(8001);
}
bootstrap();
