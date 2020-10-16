const artillery = require('@pe/artillery-kit').ArtilleryTest;
const constants = require('../constants');

function defineVariables(context, events, done) {
  context.vars.businessId = constants.BUSINESS.businessId;
  context.vars.businessName = artillery.helper.faker.random.alpha({ count: 16 });
  context.vars.business_Id = artillery.helper.faker.random.uuid();
  context.vars.reference = constants.BUSINESS.reference;
  context.vars.originalId = constants.BUSINESS.originalId;
  context.vars.transactionId = constants.BUSINESS.transactionId;
  context.vars.pdf = constants.BUSINESS.pdf;
  context.vars.slip = constants.BUSINESS.slip;
  context.vars.action = constants.BUSINESS.action;

  return done();
}

module.exports = {
  auth: artillery.helper.auth,
  defineVariables,
};
