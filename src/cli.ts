import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from '@pe/nest-kit';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app: INestApplicationContext = await NestFactory.createApplicationContext(AppModule);
  const service: CommandService = app.select(CommandModule)
    .get(CommandService);
  const aa = 'sss';

  service.exec();
}
bootstrap().catch();
