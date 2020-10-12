const artillery = require('@pe/artillery-kit').ArtilleryTest;
const constants = require('../constants');

function defineVariables(context, events, done) {
  context.vars.integrationName = artillery.helper.faker.random.alpha({ count: 16 });
  context.vars.category = constants.INTEGRATION.category;

  return done();
}

module.exports = {
  auth: artillery.helper.auth,
  defineVariables,
};
