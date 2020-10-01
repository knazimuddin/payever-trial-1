const helper = require('./helper')

function defineVariables(context, events, done) {
  context.vars.reference = '1544513830.71615c0f6926aed201.76640051';

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
