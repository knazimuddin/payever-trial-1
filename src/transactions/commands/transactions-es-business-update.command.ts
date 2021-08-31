import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ElasticSearchClient } from '@pe/elastic-kit';
import { Command, Positional } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { TransactionDoubleConverter } from '../converter';
import { ElasticTransactionEnum } from '../enum';
import { TransactionBasicInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';

@Injectable()
export class TransactionsEsBusinessUpdateCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<TransactionModel>,
    private readonly elasticSearchClient: ElasticSearchClient,
  ) { }

  @Command({
    command: 'transactions:es:business-update',
    describe: 'Update transactions ElasticSearch index for business.',
  })
  public async update(
    @Positional({
      name: 'business',
    }) businessId: string,
  ): Promise<void> {
    if (!businessId) {
      throw new Error('This command should run only with "business" option.');
    }

    const criteria: any = { };
    criteria.businessId = businessId;

    Logger.log(`Clearing "${businessId}" transactions from ElasticSearch.`);
    await this.elasticSearchClient.deleteByQuery(
      ElasticTransactionEnum.index,
      {
        query: {
          match_phrase: {
            businessId: businessId,
          },
        },
      },
    );
    Logger.log(`Clearing done.`);

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
