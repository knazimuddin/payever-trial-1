import { INestApplication, Logger, LoggerService, ValidationPipe } from '@nestjs/common';
import * as APM from 'elastic-apm-node';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestKitLogger } from '@pe/nest-kit/modules/logging/services';

import { RabbitMqServer } from '@pe/nest-kit/modules/rabbitmq';
import * as cors from 'cors';
import * as APM from 'elastic-apm-node';
import { ApplicationModule } from './app.module';

import { environment } from './environments';

async function bootstrap() {
  const app = await NestFactory.create(
    ApplicationModule,
    {
      logger: false,
    },
  );

  const logger = app.get(NestKitLogger);
  app.useLogger(logger);

  APM.isStarted() && logger.log('APM running');

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api');
  app.use(cors());

  const options = new DocumentBuilder()
    .setTitle('Transactions')
    .setDescription('The transactions app API description')
    .setVersion('1.0')
    .setBasePath('/api/')
    .addTag('transactions')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  app.connectMicroservice({
    strategy: app.get(RabbitMqServer),
  });

  await app.startAllMicroservicesAsync();
  await app.listen(
    environment.port,
    () => Logger.log(`Transactions app started at port ${environment.port}`, 'NestApplication'),
  );
}

bootstrap().then();
