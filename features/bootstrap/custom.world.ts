import { setWorldConstructor } from 'cucumber';
import { AbstractWorld } from '../../e-test-module';
import { AppModule } from '../../src/app.module';
import { options } from './options';

export class CustomWorld extends AbstractWorld {

  public constructor({attach, parameters}) {
    super(
      {attach, parameters},
      AppModule,
      options,
    );
  }
}

setWorldConstructor(CustomWorld);
