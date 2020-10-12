const artillery = require('@pe/artillery-kit').ArtilleryTest;

function defineUserId(requestParams, response, context, ee, next) {
  const body = artillery.helper.getResponseBody(response);

  if (body && body.collection && body.collection.length) {
    context.vars.userId = body.collection[0].uuid;
  }

  return next();
}

module.exports = {
  auth: artillery.helper.auth,
  defineUserId,
};
