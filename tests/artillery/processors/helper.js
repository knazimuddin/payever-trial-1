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

module.exports = {
  getResponseBody,
  generateName,
  generateUuid,
};
