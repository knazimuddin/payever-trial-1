const helper = require('./helper');

function defineUserId(requestParams, response, context, ee, next) {
  const body = helper.getResponseBody(response);

  if (body && body.collection && body.collection.length) {
    context.vars.userId = body.collection[0].uuid;
  }

  return next();
}

module.exports = {
  defineUserId,
};
