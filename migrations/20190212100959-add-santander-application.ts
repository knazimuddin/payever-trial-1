import { MongoClient, ObjectId } from 'mongodb';

async function up(db) {
  const transactionsConnectionString = db.connectionString;
  const client = new MongoClient(transactionsConnectionString);
  await client.connect();

  const transactionsDb = await client.db();

  const now = Date.now();
  const transactions = await transactionsDb.collection('transactionsschemas').find().toArray();
  const count_total = transactions.length;
  let counter = 0;
  console.log(`Processing total ${count_total} entries...`)

  const updates = [];
  for (const transaction of transactions) {
    if (!transaction.santander_application) {
      const santander_applications = [];
      const payment_details = transaction.payment_details;

      var financeIdRegexp = /"finance_id":"(\w+)"/g;
      var financeIdMatch = financeIdRegexp.exec(payment_details);
      if (financeIdMatch && financeIdMatch.length) {
        santander_applications.push(financeIdMatch[1])
      }

      var appNumRegexp = /"application_number":"(\w+)"/g;
      var appNumMatch = appNumRegexp.exec(payment_details);
      if (appNumMatch && appNumMatch.length) {
        santander_applications.push(appNumMatch[1])
      }

      var appNoRegexp = /"application_no":"(\w+)"/g;
      var appNoMatch = appNoRegexp.exec(payment_details);
      if (appNoMatch && appNoMatch.length) {
        santander_applications.push(appNoMatch[1])
      }

      updates.push(
        {
          updateOne:
          {
            filter: { _id: transaction._id },
            update: { $set: { santander_applications } }
          }
        }
      )
    }

    counter++;
    if (counter % 1000 === 0) {
      console.log(`Processed ${counter} of ${count_total}`)
    }
  }

  await transactionsDb.collection('transactionsschemas').bulkWrite(updates);
  await client.close();
  console.log(`Completed in ${Date.now() - now}ms`)

  return null;
}

async function down() {
  return null;
}

module.exports.up = up;
module.exports.down = down;
