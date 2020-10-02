const helper = require('./helper');
const constants = require('../constants');

function defineVariables(context, events, done) {
  context.vars.integrationName = `${helper.generateName()}`;
  context.vars.category = constants.INTEGRATION.category;

  return done();
}

module.exports = {
  defineVariables,
};
