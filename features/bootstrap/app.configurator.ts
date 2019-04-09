import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppConfiguratorInterface } from '@pe/cucumber-sdk';
import * as cors from 'cors';

export class AppConfigurator implements AppConfiguratorInterface {
  public setup(application: INestApplication): void {
    application.useGlobalPipes(new ValidationPipe());
    application.setGlobalPrefix('/api');
    application.use(cors());
  }
}
