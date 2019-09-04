import { AbstractWorld } from '@pe/cucumber-sdk';
import { setWorldConstructor } from 'cucumber';
import { AppModule } from '../../src/app.module';
import { options } from './options';
import { EmitterConsumerInitializer } from '../../src/transactions/emitter';

export class CustomWorld extends AbstractWorld {
  protected application: INestApplication;
  protected consumersInitialized: boolean;

  public constructor({attach, parameters}) {
    super(
      {attach, parameters},
      AppModule,
      options,
    );
  }

  public async init(scenario): Promise<void> {
    await super.init(scenario);
    if (!this.consumersInitialized) {
      this.application.get(EmitterConsumerInitializer).init();
      this.consumersInitialized = true;
    }
  }
}

setWorldConstructor(CustomWorld);
