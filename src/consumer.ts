import { INestApplicationContext, INestMicroservice, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { RABBITMQ_SERVER } from '@pe/nest-kit';
import { NestKitLogger } from '@pe/nest-kit/modules/logging/services';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const context: INestApplicationContext = await NestFactory.createApplicationContext(AppModule);

  const app: INestMicroservice = await NestFactory.createMicroservice(
    AppModule,
    {
      logger: false,
      strategy: context.get(RABBITMQ_SERVER),
    },
  );

  const logger: NestKitLogger = app.get(NestKitLogger);
  app.useLogger(logger);

  app.useGlobalPipes(new ValidationPipe());

  app.listen(() => logger.log(`Transactions consumer started`, 'NestApplication'));
}

bootstrap().then();
