import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from '@pe/nest-kit/modules/command';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ApplicationModule);
  app.select(CommandModule)
    .get(CommandService)
    .exec()
  ;
}
bootstrap().then();
