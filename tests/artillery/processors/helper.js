const faker = require('faker');

function getResponseBody(response) {
  return response.body ? JSON.parse(response.toJSON().body) : null;
}

function generateName(length = 16) {
  return faker.random.alpha(length);
}

function generateUuid() {
  return faker.random.uuid();
}

function getBusinessId(response) {
  const body = getResponseBody(response);
  const business = (body || []).find(b => b.active);

  if (business) {
    return business._id;
  }

  console.error('user has no active business');

  return null;
}

module.exports = {
  getResponseBody,
  generateName,
  generateUuid,
  getBusinessId,
};
