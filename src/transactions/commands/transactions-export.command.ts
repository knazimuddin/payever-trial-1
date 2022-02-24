
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command, Positional } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { TransactionModel } from '../models';
import { TransactionEventProducer } from '../producer';

@Injectable()
export class TransactionsExportCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<TransactionModel>,
    private readonly transactionEventProducer: TransactionEventProducer,
  ) { }

  @Command({ command: 'transactions:export:bus', describe: 'Export transactions through bus' })
  public async export(
    @Positional({
      name: 'after',
    }) after: string,
    @Positional({
      name: 'before',
    }) before: string,
    @Positional({
      name: 'business',
    }) business_uuid: string,
  ): Promise<void> {
    const criteria: any = { };
    if (before || after) {
      criteria.updated_at = { };
    }
    if (before) {
      criteria.updated_at.$lte = new Date(before);
    }
    if (after) {
      criteria.updated_at.$gte = new Date(after);
    }
    if (business_uuid) {
      criteria.business_uuid = business_uuid;
    }

    Logger.log(`Criteria is ${JSON.stringify(criteria, null, 2)}.`);

    const total: number = await this.transactionsModel.countDocuments(criteria);
    Logger.log(`Found ${total} records.`);

    const limit: number = 1000;
    let processed: number = 0;

    while (processed < total) {
      const transactions: TransactionModel[] = await this.getWithLimit(processed, limit, criteria);
      Logger.log(`Starting next ${transactions.length} transactions.`);

      for (const transaction of transactions) {
        await this.transactionEventProducer.produceTransactionExportEvent(transaction.toObject());
      }

      processed += transactions.length;
      Logger.log(`Exported ${processed} of ${total}.`);
    }
  }

  private async getWithLimit(start: number, limit: number, criteria: any): Promise<any[]> {
    return this.transactionsModel.find(
      criteria,
      null,
      {
        limit: limit,
        skip: start,
        sort: { _id: 1 },
      },
    );
  }
}
