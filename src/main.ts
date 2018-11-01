import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApplicationModule } from './app.module';
import * as cors from 'cors';

import { RabbitmqServer } from '@pe/nest-kit/modules/rabbitmq';

import { environment } from './environments';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);

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
    strategy: new RabbitmqServer(environment.rabbitmq),
  });

  await app.startAllMicroservicesAsync();
  await app.listen(environment.port, () => console.log('app started at port', environment.port));

  // @TODO remove
  console.log('Hello, if you see it then latest changes were deployed');

}
bootstrap();
