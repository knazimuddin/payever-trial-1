import { After, Before } from 'cucumber';
import { ContextInterface } from '../context.interface';

export class WorldContext implements ContextInterface {
  public resolve() {
    Before(async function(scenario) {
      await this.initApplication(scenario);
    });

    After(async function() {
      await this.closeApplication();
    });
  }
}
