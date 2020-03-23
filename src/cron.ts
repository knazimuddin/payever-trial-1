import { INestApplicationContext, INestMicroservice } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestKitLogger } from '@pe/nest-kit/modules/logging/services';
import { AppModule } from './app.module';
import { environment } from './environments';
import { SendDailyReportTransactionsCron } from './transactions/cron';
import { ConnectionMonitoring } from "@pe/nest-kit";

async function bootstrap(): Promise<void> {
  const context: INestApplicationContext = await NestFactory.createApplicationContext(
    AppModule,
  );

  environment.enableCron = false;

  const app: INestMicroservice = await NestFactory.createMicroservice(
    AppModule,
    {
      strategy: context.get(SendDailyReportTransactionsCron),
    },
  );

  const logger: NestKitLogger = app.get(NestKitLogger);
  app.useLogger(logger);

  ConnectionMonitoring.start(app, bootstrap);

  app.listen(() => logger.log(`Cron started`, 'NestApplication'));
}

bootstrap().then();
