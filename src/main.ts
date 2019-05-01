import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestKitLogger } from '@pe/nest-kit/modules/logging/services';
import * as APM from 'elastic-apm-node';

import { RABBITMQ_SERVER } from '@pe/nest-kit';
import * as cors from 'cors';
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
  // app.use(cors());
  app.enableCors({ maxAge: 600 });

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
    strategy: app.get(RABBITMQ_SERVER),
  });

  await app.startAllMicroservicesAsync();
  app.enableShutdownHooks();
  await app.listen(environment.port, () => logger.log(`Transactions app started at port ${environment.port}`));
}

bootstrap();
