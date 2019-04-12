import { MongoClient } from 'mongodb';

async function up(db) {
  const transactionsConnectionString = db.connectionString;
  const client = new MongoClient(transactionsConnectionString);
  await client.connect();

  const transactionsDb = await client.db();

  const now = Date.now();
  const dupTransactions = await transactionsDb.collection('transactions').aggregate(
    [
      {
        $group: {
          _id: {
            uuid: '$uuid',
          },
          uniqueIds: {
            $addToSet: '$_id',
          },
          count: {
            $sum: 1.0,
          },
        },
      },
      {
        $match: {
          count: {
            $gt: 1.0,
          },
        },
      },
      {
        $sort: {
          count: -1.0,
        },
      },
    ],
  );

  const deletes = [];

  while (await dupTransactions.hasNext()) {
    const doc = await dupTransactions.next();
    let index = 1;
    while (index < doc.uniqueIds.length) {
      deletes.push(doc.uniqueIds[index]);
      index = index + 1;
    }
  }

  await transactionsDb.collection('transactions').deleteMany({ _id: { $in: deletes } });

  if (await transactionsDb.collection('transactions').indexExists(['uuid_1', 'original_id_1'])) {
    await transactionsDb.collection('transactions').dropIndex('uuid_1');
    await transactionsDb.collection('transactions').dropIndex('original_id_1');
  }

  await transactionsDb.collection('transactions').createIndex({ original_id: 1 }, { unique: true, sparse: true });
  await transactionsDb.collection('transactions').createIndex({ uuid: 1 }, { unique: true });

  await client.close();
  console.log(`Deleted ${deletes.length} entries. Completed in ${Date.now() - now}ms`);

  return null;
}

async function down() {
  return null;
}

module.exports.up = up;
module.exports.down = down;
