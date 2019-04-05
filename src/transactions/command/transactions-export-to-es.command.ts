import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Command } from '@pe/nest-kit/modules/command';
import {client} from "../es-temp/transactions-search";

const bulkIndex =  async (index, type, data) => {
  const bulkBody = [];
  data.forEach(item => {
    item = item.toObject();
    item.mongoId = item._id;
    delete item._id;
    bulkBody.push({
      index: {
        _index: index,
        _type: type,
        _id: item.mongoId,
      },
    });

    bulkBody.push(item);
  });

  if (!bulkBody.length) {
    return;
  }
  await client.bulk({body: bulkBody})
    .then(response => {
      let errorCount = 0;
      response.items.forEach(item => {
        if (item.index && item.index.error) {
          console.log(++errorCount, item.index.error);
        }
      });
      console.log(
        `Successfully indexed ${data.length - errorCount}
         out of ${data.length} items`,
      );
    })
    .catch(console.log);
};

@Injectable()
export class TransactionsEsExportCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<any>,
  ) { }

  @Command({ command: 'transactions:export:es', describe: 'Export transactions for widgets' })
  public async transactionsEsExport() {
    const count: number = await this.transactionsModel.countDocuments();
    const limit: number = 200;
    let start: number = 0;

    while (start < count) {
      const transactions = await this.getWithLimit(start, limit);
      start += limit;
      console.log(`${transactions.length} items parsed`);
      await bulkIndex('transactions', 'transaction', transactions);

      console.log(`Exported ${start} of ${count}`);
    }
  }

  private async getWithLimit(start: number, limit: number): Promise<any[]> {
    return this.transactionsModel.find(
      {
      },
      null,
      {
        sort: { _id: 1 },
        skip: start,
        limit: limit,
      },
    );
  }
}
