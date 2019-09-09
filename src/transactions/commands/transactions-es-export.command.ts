import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command, Positional } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { TransactionDoubleConverter } from '../converter';
import { ElasticSearchClient } from '../elasticsearch/elastic-search.client';
import { ElasticTransactionEnum } from '../enum';
import { TransactionBasicInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';

@Injectable()
export class TransactionsEsExportCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<TransactionModel>,
    private readonly elasticSearchClient: ElasticSearchClient,
  ) {}

  @Command({ command: 'transactions:es:export', describe: 'Export transactions for ElasticSearch' })
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
    const criteria: any = {};
    if (before || after) {
      criteria.updated_at = {};
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
      const prepared: TransactionBasicInterface[] = [];

      for (const transaction of transactions) {
        prepared.push(TransactionDoubleConverter.pack(transaction.toObject()));
      }

      await this.elasticSearchClient.bulkIndex(
        ElasticTransactionEnum.index,
        ElasticTransactionEnum.type,
        prepared,
      );

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
