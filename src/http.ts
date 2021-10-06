import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import jwt from 'fastify-jwt';
import * as qs from 'qs';
import { useContainer } from 'class-validator';

import { NestKitLogger } from '@pe/nest-kit/modules/logging/services';
import { AppModule } from './app.module';
import { environment } from './environments';

async function bootstrap(): Promise<void> {
  const app: NestFastifyApplication = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 524288000,

      maxParamLength: 255,
      querystringParser: (str: string): any => qs.parse(str),
    }),
  );

  await app.register(jwt, { secret: environment.jwtOptions.secret });
  const logger: NestKitLogger = app.get(NestKitLogger);
  app.useLogger(logger);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api');

  if (environment.appCors) {
    app.enableCors({ maxAge: 600 });
  }

  app.enableShutdownHooks();

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const options: DocumentBuilder = new DocumentBuilder()
    .setTitle('Transactions')
    .setDescription('The transactions app API description')
    .setVersion('1.0')
    .setBasePath('/api/')
    .addTag('transactions')
    .addBearerAuth();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, options.build());
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(
    environment.port,
    '0.0.0.0',
    () => logger.log(`Transactions app started at port ${environment.port}`, 'NestApplication'),
  );
}

bootstrap().catch();
