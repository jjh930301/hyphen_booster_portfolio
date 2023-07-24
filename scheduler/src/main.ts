import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // using scheduler container
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
}
bootstrap();
