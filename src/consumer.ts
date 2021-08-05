import { INestApplicationContext, INestMicroservice } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Consumer } from '@pe/nest-kit';
import { ProviderNameTransformer, ArgvQueueNameExtractor } from '@pe/nest-kit/modules/rabbit-mq';
import { NestKitLogger } from '@pe/nest-kit/modules/logging/services';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const context: INestApplicationContext = await NestFactory.createApplicationContext(AppModule);
  const queueName: string = ArgvQueueNameExtractor.extract(process.argv);
  const consumerName: string = ProviderNameTransformer.transform(queueName);
  const server: Consumer = context.get(consumerName);

  const app: INestMicroservice = await NestFactory.createMicroservice(
    AppModule,
    {
      logger: false,
      strategy: server,
    });

  const logger: NestKitLogger = app.get(NestKitLogger);
  app.useLogger(logger);

  app.listen(() => logger.log(`Transactions queue: ${queueName} consumer started`, 'NestApplication'));
}

bootstrap().catch();
