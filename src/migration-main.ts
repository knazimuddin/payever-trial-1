import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MigrationAppModule } from './migration-app.module';
import * as cors from 'cors';

import { environment } from './environments';

async function bootstrap() {

  const app = await NestFactory.create(MigrationAppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api');
  app.use(cors());

  await app.listen(environment.port);
}
bootstrap();
