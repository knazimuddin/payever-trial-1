// tslint:disable-next-line: file-name-casing
import { MongoClient, Db } from 'mongodb';

async function up(db: any): Promise<any> {
  const transactionsConnectionString: string = db.connectionString;
  const client: MongoClient = new MongoClient(transactionsConnectionString);
  await client.connect();

  const transactionsDb: Db =  client.db();

  const now: number = Date.now();
  const dupTransactions: any =  transactionsDb.collection('transactions').aggregate(
    [
      {
        $group: {
          _id: {
            uuid: '$uuid',
          },
          count: {
            $sum: 1.0,
          },
          uniqueIds: {
            $addToSet: '$_id',
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

  const deletes: any[] = [];

  while (await dupTransactions.hasNext()) {
    const doc: any = await dupTransactions.next();
    let index: number = 1;
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
  // tslint:disable-next-line: no-console
  console.log(`Deleted ${deletes.length} entries. Completed in ${Date.now() - now}ms`);

  return null;
}

async function down(): Promise<any> {
  return null;
}

module.exports.up = up;
module.exports.down = down;
