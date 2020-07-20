import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NestKitLogger } from '@pe/nest-kit/modules/logging/services';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { environment } from './environments';
import { CustomWsAdapter } from './transactions/ws';

async function bootstrap(): Promise<void> {
  const app: NestFastifyApplication = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const logger: Logger = app.get(NestKitLogger);
  app.useLogger(logger);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api');
  app.enableShutdownHooks();

  app.useWebSocketAdapter(
    new CustomWsAdapter(
      environment.webSocket.port,
      app.getHttpServer(),
      logger,
    ),
  );

  await app.startAllMicroservicesAsync();

  await app.listen(
    environment.port,
    '0.0.0.0',
    () => logger.log(`Transactions WebSocket instance started at port [${environment.webSocket.port}]`, 'NestApplication'),
  );
}
bootstrap().catch();
