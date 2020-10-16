const artillery = require('@pe/artillery-kit').ArtilleryTest;
const constants = require('../constants');

function defineVariables(context, events, done) {
  context.vars.reference = constants.ADMIN.reference;
  context.vars.transactionId = constants.ADMIN.transactionId;

  return done();
}

function defineAdminId(requestParams, response, context, ee, next) {
  const body = artillery.helper.getResponseBody(response);

  if (body && body.collection && body.collection.length) {
    context.vars.adminId = body.collection[0].uuid;
  }

  return next();
}

module.exports = {
  auth: artillery.helper.auth,
  defineVariables,
  defineAdminId,
};
