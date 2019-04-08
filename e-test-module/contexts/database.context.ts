import { After, Before, Given } from 'cucumber';
import { ContextInterface } from '../context.interface';

export class DatabaseContext implements ContextInterface {
  public resolve() {
    Before(async function(scenario) {
      await this.initApplication(scenario);
    });

    After(async function() {
      await this.closeApplication();
    });

    Given(/^print database name$/, function() {
      this.attach(`Using database "${this.getDatabaseProvider().getDatabaseName()}"`);
    });

    Given(/^I use DB fixture "([^"]*)"$/, async function(fixture: string) {
      this.getDatabaseProvider().applyFixture(fixture);
    });
  }
}
