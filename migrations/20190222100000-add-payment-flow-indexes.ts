async function up(db: any): Promise<any> {
  db.addIndex('paymentflows', 'id_1', ['id'], true);
  db.addIndex('paymentflows', 'channel_set_uuid_1', ['channel_set_uuid']);
  db.addIndex('paymentflows', 'reference_1', ['reference']);
  db.addIndex('paymentflows', 'state_1', ['state']);

  return null;
}

async function down(): Promise<any> {
  return null;
}

module.exports.up = up;
module.exports.down = down;
