import { AbstractWorld } from '@pe/cucumber-sdk/module/abstract.world';
import { setWorldConstructor } from 'cucumber';
import { ApplicationModule } from '../../src/app.module';
import { options } from './options';

export class CustomWorld extends AbstractWorld {
  public constructor({attach, parameters}) {
    super(
      {attach, parameters},
      ApplicationModule,
      options,
    );
  }
}

setWorldConstructor(CustomWorld);
