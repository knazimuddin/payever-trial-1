async function up(db) {
  const transactions = await db._find('transactionsschemas', {});
  const count_total = transactions.length;
  let counter = 0;
  console.log(`Processing total ${count_total} entries...`)

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

      await db._run(
        'update',
        'transactionsschemas',
        {
          query: { _id: transaction._id },
          update: { $set: { santander_applications } },
          options: {},
        },
      );
    }

    counter++;
    if (counter % 1000 === 0) {
      console.log(`Processed ${counter} of ${count_total}`)
    }
  }

  return null;
}

async function down() {
  return null;
}

module.exports.up = up;
module.exports.down = down;
