const helper = require('./helper');
const constants = require('../constants');

function defineVariables(context, events, done) {
  context.vars.businessName = helper.generateName();
  context.vars.business_Id = helper.generateUuid();
  context.vars.reference = constants.BUSINESS.reference;
  context.vars.originalId = constants.BUSINESS.originalId;
  context.vars.transactionId = constants.BUSINESS.transactionId;
  context.vars.pdf = constants.BUSINESS.pdf;
  context.vars.slip = constants.BUSINESS.slip;
  context.vars.action = constants.BUSINESS.action;

  return done();
}

function defineBusinessId(requestParams, response, context, ee, next) {
  const body = helper.getResponseBody(response);
  const business = (body || []).find(b => b.active);

  if (business) {
    context.vars.businessId =  business._id;
  }

  return next();
}

module.exports = {
  defineVariables,
  defineBusinessId,
};
