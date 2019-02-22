async function up(db) {
  db.collection('paymentflowschemas').createIndex({ id: 1 }, { unique: true });
  db.collection('paymentflowschemas').createIndex({ channel_set_uuid: 1 });
  db.collection('paymentflowschemas').createIndex({ reference: 1 });
  db.collection('paymentflowschemas').createIndex({ state: 1 });

  return null;
}

async function down() {
  return null;
}

module.exports.up = up;
module.exports.down = down;
