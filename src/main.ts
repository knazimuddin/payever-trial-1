import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerBaseConfig, SwaggerDocument, SwaggerModule } from '@nestjs/swagger';
import { RABBITMQ_SERVER } from '@pe/nest-kit';
import { NestKitLogger } from '@pe/nest-kit/modules/logging/services';
import * as APM from 'elastic-apm-node';
import * as jwt from 'fastify-jwt';

import { AppModule } from './app.module';
import { environment } from './environments';

async function bootstrap(): Promise<void> {
  const app: NestFastifyApplication = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: false,
    },
  );

  app.register(jwt, {secret: environment.jwtOptions.secretOrPrivateKey});
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
    '0.0.0.0',
    () => logger.log(`Transactions app started at port ${environment.port}`, 'NestApplication'),
  );
}

bootstrap().then();
