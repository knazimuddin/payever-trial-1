const integrationProcessor = require('./integration');
const businessProcessor = require('./business');
const adminProcessor = require('./admin');
const userProcessor = require('./user');

module.exports = {
  defineIntegrationVariables: integrationProcessor.defineVariables,
  defineBusinessVariables: businessProcessor.defineVariables,
  defineBusinessId: businessProcessor.defineBusinessId,
  defineAdminVariables: adminProcessor.defineVariables,
  defineAdminId: adminProcessor.defineAdminId,
  defineUserId: userProcessor.defineUserId,
};
