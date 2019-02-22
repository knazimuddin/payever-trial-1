async function up(db) {
  db.addIndex('paymentflowschemas', 'id_1', ['id'], true);
  db.addIndex('paymentflowschemas', 'channel_set_uuid_1', ['channel_set_uuid']);
  db.addIndex('paymentflowschemas', 'reference_1', ['reference']);
  db.addIndex('paymentflowschemas', 'state_1', ['state']);

  return null;
}

async function down() {
  return null;
}

module.exports.up = up;
module.exports.down = down;
