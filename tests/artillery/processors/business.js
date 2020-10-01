const helper = require('./helper');

function defineVariables(context, events, done) {
  context.vars.businessName = helper.generateName();
  context.vars.business_Id = helper.generateUuid();
  context.vars.reference = 'test';
  context.vars.originalId = '315499c61b547cc60f7f5bc709148b5c';
  context.vars.transactionId = 'a9adcd58-7e4e-4c00-9aa2-bfbba975a3a7';

  return done();
}

function defineBusinessId(requestParams, response, context, ee, next) {
  context.vars.businessId = helper.getBusinessId(response);

  return next();
}

module.exports = {
  defineVariables,
  defineBusinessId,
};
