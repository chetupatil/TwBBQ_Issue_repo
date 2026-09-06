import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  await app.listen(3001);
  // eslint-disable-next-line no-console
  console.log('TWBBQ Issues API listening on http://localhost:3001');
}
bootstrap();
