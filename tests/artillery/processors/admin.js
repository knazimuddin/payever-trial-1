const helper = require('./helper');
const constants = require('../constants');

function defineVariables(context, events, done) {
  context.vars.reference = constants.ADMIN.reference;

  return done();
}

function defineAdminId(requestParams, response, context, ee, next) {
  const body = helper.getResponseBody(response);

  if (body && body.collection && body.collection.length) {
    context.vars.adminId = body.collection[0].uuid;
  }

  return next();
}

module.exports = {
  defineVariables,
  defineAdminId,
};
