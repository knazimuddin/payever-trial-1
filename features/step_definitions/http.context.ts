import { assert } from 'chai';
import { After, Before, Given, Then, When } from 'cucumber';
import { SuperAgentRequest } from 'superagent';
import { JsonAssertion } from '../bootstrap/tools/json-assertion';

Before(async function(scenario) {
  await this.initApplication(scenario);
});

After(async function() {
  await this.closeApplication();
});

Given(/^I set header "([^"]*)" with value "([^"]*)"$/, async function(name: string, value: string) {
  this.addHeader(name, value);
});

When(/^(?:I )?send a ([A-Z]+) request to "([^"]+)"$/, async function(method: string, url: string) {
  this.response = await this.getRequest(method, url);
});

When(
  /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with json:/,
  async function(method: string, url: string, jsonString: string) {
    const request: SuperAgentRequest = this.getRequest(method, url)
      .send(JSON.parse(jsonString))
      .set('Accept', 'application/json')
    ;
    this.applyHeaders(request);
    this.response = await request;
  },
);

Then(/^(?:the )?response (?:status )?code should be (\d+)$/, function(statusString: string) {
  assert.equal(this.response.status, statusString);
});

Then(/^(?:the )?response should contain json:$/, function(jsonString: string) {
  const search: {} = JSON.parse(jsonString);
  assert.isAtLeast(
    JSON.stringify(this.response.body).length,
    JSON.stringify(search).length,
  );
  JsonAssertion.assertContains(this.response.body, search);
});

Then(/^print last response$/, function() {
  this.attach(
    JSON.stringify(
      {
        status: this.response.status,
        headers: this.response.headers,
        body: this.response.body,
      },
    ),
  );
});
