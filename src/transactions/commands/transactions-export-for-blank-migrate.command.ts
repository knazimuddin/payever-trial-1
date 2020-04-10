import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { TransactionModel } from '../models';
import { TransactionEventProducer } from '../producer';

@Injectable()
export class TransactionsExportForBlankMigrateCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<TransactionModel>,
    private readonly transactionsEventProducer: TransactionEventProducer,
  ) {}

  @Command({ command: 'transactions:export:blank-migrate', describe: 'Migrate transactions to fill new services' })
  public async transactionsMigrate(): Promise<void> {
    const count: number = await this.transactionsModel.estimatedDocumentCount();
    const limit: number = 1000;
    let start: number = 0;
    let transactions: TransactionModel[] = [];
    let processed: number = 0;

    while (start < count) {
      transactions = await this.getWithLimit(start, limit);
      start += limit;
      processed += transactions.length;

      for (const transactionModel of transactions) {
        await this.transactionsEventProducer.produceTransactionBlankMigrateEvent(transactionModel);
      }

      Logger.log(`Migrated ${processed} of ${count}`);
    }
  }

  private async getWithLimit(start: number, limit: number): Promise<TransactionModel[]> {
    return this.transactionsModel.find(
      {},
      null,
      {
        limit: limit,
        skip: start,
        sort: { _id: 1 },
      },
    );
  }
}
