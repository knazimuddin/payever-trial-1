import { MongoClient, Db } from 'mongodb';

// tslint:disable-next-line: cognitive-complexity
async function up(db: any): Promise<any> {
  const transactionsConnectionString: string = db.connectionString;
  const client: MongoClient = new MongoClient(transactionsConnectionString);
  await client.connect();

  const transactionsDb: Db = client.db();

  const now: number = Date.now();
  const transactions: any[] = await transactionsDb.collection('transactions').find().toArray();
  const count_total: number = transactions.length;
  let counter: number = 0;
  // tslint:disable-next-line: no-console
  console.log(`Processing total ${count_total} entries...`)

  const updates: any[] = [];
  for (const transaction of transactions) {
    if (!transaction.santander_applications) {
      const santander_applications: any[] = [];
      const payment_details: any = transaction.payment_details;

      const financeIdRegexp: any = /"finance_id":"(\w+)"/g;
      const financeIdMatch: any = financeIdRegexp.exec(payment_details);
      if (financeIdMatch && financeIdMatch.length) {
        santander_applications.push(financeIdMatch[1])
      }

      const appNumRegexp: any = /"application_number":"(\w+)"/g;
      const appNumMatch: any = appNumRegexp.exec(payment_details);
      if (appNumMatch && appNumMatch.length) {
        santander_applications.push(appNumMatch[1])
      }

      const appNoRegexp: any = /"application_no":"(\w+)"/g;
      const appNoMatch: any = appNoRegexp.exec(payment_details);
      if (appNoMatch && appNoMatch.length) {
        santander_applications.push(appNoMatch[1])
      }

      updates.push(
        {
          updateOne:
          {
            filter: { _id: transaction._id },
            update: { $set: { santander_applications } },
          },
        },
      );
    }

    counter++;
    if (counter % 1000 === 0) {
      // tslint:disable-next-line: no-console
      console.log(`Processed ${counter} of ${count_total}`);
    }
  }

  await transactionsDb.collection('transactions').bulkWrite(updates);
  await client.close();
  // tslint:disable-next-line: no-console
  console.log(`Completed in ${Date.now() - now}ms`)

  return null;
}

async function down(): Promise<any> {
  return null;
}

module.exports.up = up;
module.exports.down = down;
