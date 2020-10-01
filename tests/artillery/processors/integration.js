const helper = require('./helper')

function defineVariables(context, events, done) {
  context.vars.integrationName = `${helper.generateName()}`;
  context.vars.category = 'payments';

  return done();
}

module.exports = {
  defineVariables,
};
