import { INestApplication, ValidationPipe } from '@nestjs/common';

export class AppConfigurator {
  public setup(application: INestApplication): void {
    application.useGlobalPipes(new ValidationPipe());
    application.setGlobalPrefix('/api');
  }
}
