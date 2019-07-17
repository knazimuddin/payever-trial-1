import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerBaseConfig, SwaggerDocument, SwaggerModule } from '@nestjs/swagger';
import { RABBITMQ_SERVER } from '@pe/nest-kit';
import { NestKitLogger } from '@pe/nest-kit/modules/logging/services';
import * as APM from 'elastic-apm-node';

import { AppModule } from './app.module';
import { environment } from './environments';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(
    AppModule,
    {
      logger: false,
    },
  );

  const logger: NestKitLogger = app.get(NestKitLogger);
  app.useLogger(logger);

  APM.isStarted() && logger.log('APM running');

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api');
  app.enableCors({ maxAge: 600 });
  app.enableShutdownHooks();

  const options: SwaggerBaseConfig = new DocumentBuilder()
    .setTitle('Transactions')
    .setDescription('The transactions app API description')
    .setVersion('1.0')
    .setBasePath('/api/')
    .addTag('transactions')
    .addBearerAuth()
    .build();
  const document: SwaggerDocument = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  app.connectMicroservice({
    strategy: app.get(RABBITMQ_SERVER),
  });

  await app.startAllMicroservicesAsync();
  await app.listen(
    environment.port,
    () => logger.log(`Transactions app started at port ${environment.port}`, 'NestApplication'),
  );
}

bootstrap().then();
