import { AbstractWorld } from '@pe/cucumber-sdk';
import { setWorldConstructor } from 'cucumber';
import { AppModule } from '../../src/app.module';
import { options } from './options';

export class CustomWorld extends AbstractWorld {
  public constructor({ attach, parameters }: { attach: any, parameters: any }) {
    super(
      {attach, parameters},
      AppModule,
      options,
    );
  }
}

setWorldConstructor(CustomWorld);
