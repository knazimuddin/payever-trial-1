import { After, Before } from 'cucumber';

Before(async function(scenario) {
  await this.initApplication(scenario);
});

After(async function() {
  await this.closeApplication();
});
